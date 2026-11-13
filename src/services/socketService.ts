import { io, Socket } from 'socket.io-client';

const getWsUrl = (): string => {
  const envWsUrl = import.meta.env.VITE_WS_URL;
  if (envWsUrl) return envWsUrl;

  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl.replace(/\/api\/?$/, '');
  }

  return 'http://localhost:3000';
};

/** Bàn + khung giờ được giữ (khóa giữ bàn tính theo từng khung giờ, không phải cả ngày) */
export interface ITableSlot {
  branchId: string;
  tableId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

/** Payload các sự kiện table:locked / table:released / table:reserved / table:lock_success */
export interface ITableLockEvent extends Partial<ITableSlot> {
  tableId: string;
  lockedBy?: string;
  expiresAt?: string;
  tableNumber?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private branchRefCounts = new Map<string, number>();
  private kitchenRefCounts = new Map<string, number>();
  private tableRefCounts = new Map<string, number>();
  private adminRefCount = 0;
  private listeners = new Map<string, Set<(...args: any[]) => void>>();
  private authKey: string | null = null;

  /**
   * Re-join toàn bộ room đang đăng ký (khi socket connect/reconnect)
   */
  private rejoinRooms() {
    if (!this.socket) return;

    this.branchRefCounts.forEach((count, branchId) => {
      if (count > 0) this.socket?.emit('branch:join', { branchId });
    });
    this.kitchenRefCounts.forEach((count, branchId) => {
      if (count > 0) this.socket?.emit('kitchen:join', { branchId });
    });
    this.tableRefCounts.forEach((count, tableId) => {
      if (count > 0) this.socket?.emit('table:join', { tableId });
    });
    if (this.adminRefCount > 0) {
      this.socket.emit('admin:join');
    }
  }

  private incrementRoom(
    refMap: Map<string, number>,
    key: string,
    emitEvent: string,
    payload: Record<string, string>
  ) {
    const prev = refMap.get(key) ?? 0;
    refMap.set(key, prev + 1);
    if (prev === 0 && this.socket) {
      this.socket.emit(emitEvent, payload);
    }
  }

  private decrementRoom(
    refMap: Map<string, number>,
    key: string,
    emitEvent: string,
    payload: Record<string, string>
  ) {
    const prev = refMap.get(key) ?? 0;
    if (prev <= 1) {
      refMap.delete(key);
      if (prev === 1 && this.socket) {
        this.socket.emit(emitEvent, payload);
      }
    } else {
      refMap.set(key, prev - 1);
    }
  }

  /**
   * Khởi tạo kết nối Socket.IO
   * - Server xác thực từ cookie `accessToken` tại thời điểm handshake, nên khi người dùng
   *   đăng nhập/đăng xuất (authKey thay đổi) cần tạo lại kết nối để server nhận đúng danh tính.
   */
  connect(authKey?: string | null, token?: string): Socket {
    const nextAuthKey = authKey === undefined ? this.authKey : authKey;

    if (this.socket && this.authKey === nextAuthKey) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.authKey = nextAuthKey;
    const wsUrl = getWsUrl();
    this.socket = io(wsUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
    });

    // Re-attach registered event listeners when socket instance is recreated
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        this.socket?.on(event, cb);
      });
    });

    this.socket.on('connect', () => {
      console.log('⚡ [Socket] Connected to server:', this.socket?.id);
      this.rejoinRooms();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ [Socket] Connection error:', error.message);
    });

    return this.socket;
  }

  /**
   * Ngắt kết nối Socket.IO
   */
  disconnect() {
    if (this.socket) {
      this.branchRefCounts.forEach((count, branchId) => {
        if (count > 0) this.socket?.emit('branch:leave', { branchId });
      });
      this.kitchenRefCounts.forEach((count, branchId) => {
        if (count > 0) this.socket?.emit('kitchen:leave', { branchId });
      });
      this.tableRefCounts.forEach((count, tableId) => {
        if (count > 0) this.socket?.emit('table:leave', { tableId });
      });
      if (this.adminRefCount > 0) {
        this.socket.emit('admin:leave');
      }
      this.socket.disconnect();
      this.socket = null;
      this.branchRefCounts.clear();
      this.kitchenRefCounts.clear();
      this.tableRefCounts.clear();
      this.adminRefCount = 0;
      this.authKey = null;
    }
  }

  /**
   * Tham gia phòng chi nhánh để nhận broadcast thời gian thực
   */
  joinBranch(branchId: string) {
    if (!branchId) return;
    this.incrementRoom(this.branchRefCounts, branchId, 'branch:join', { branchId });
  }

  /**
   * Rời khỏi phòng chi nhánh
   */
  leaveBranch(branchId: string) {
    if (!branchId) return;
    this.decrementRoom(this.branchRefCounts, branchId, 'branch:leave', { branchId });
  }

  /**
   * Tham gia phòng giám sát toàn hệ thống dành cho Admin
   */
  joinAdmin() {
    const prev = this.adminRefCount;
    this.adminRefCount = prev + 1;
    if (prev === 0 && this.socket) {
      this.socket.emit('admin:join');
    }
  }

  /**
   * Rời khỏi phòng giám sát Admin
   */
  leaveAdmin() {
    if (this.adminRefCount <= 1) {
      const wasActive = this.adminRefCount === 1;
      this.adminRefCount = 0;
      if (wasActive && this.socket) {
        this.socket.emit('admin:leave');
      }
    } else {
      this.adminRefCount -= 1;
    }
  }

  /**
   * Màn hình Bếp tham gia phòng bếp chi nhánh
   */
  joinKitchen(branchId: string) {
    if (!branchId) return;
    this.incrementRoom(this.kitchenRefCounts, branchId, 'kitchen:join', { branchId });
  }

  /**
   * Rời khỏi phòng bếp chi nhánh
   */
  leaveKitchen(branchId: string) {
    if (!branchId) return;
    this.decrementRoom(this.kitchenRefCounts, branchId, 'kitchen:leave', { branchId });
  }

  /**
   * Khách tại bàn / Nhân viên tham gia kênh riêng của bàn ăn
   */
  joinTable(tableId: string) {
    if (!tableId) return;
    this.incrementRoom(this.tableRefCounts, tableId, 'table:join', { tableId });
  }

  /**
   * Rời khỏi kênh bàn ăn
   */
  leaveTable(tableId: string) {
    if (!tableId) return;
    this.decrementRoom(this.tableRefCounts, tableId, 'table:leave', { tableId });
  }

  /**
   * Gửi yêu cầu giữ bàn tạm thời (Table Lock) cho một khung giờ cụ thể
   */
  lockTable(slot: ITableSlot & { guestCount?: number }) {
    if (this.socket) {
      this.socket.emit('table:lock', slot);
    }
  }

  /**
   * Gửi yêu cầu nhả bàn (Table Release) của một khung giờ
   */
  releaseTable(slot: ITableSlot) {
    if (this.socket) {
      this.socket.emit('table:release', slot);
    }
  }

  /**
   * Đăng ký lắng nghe sự kiện
   */
  on(event: string, callback: (...args: any[]) => void) {
    let callbacks = this.listeners.get(event);
    if (!callbacks) {
      callbacks = new Set();
      this.listeners.set(event, callbacks);
    }
    if (!callbacks.has(callback)) {
      callbacks.add(callback);
      this.socket?.on(event, callback);
    }
  }

  /**
   * Hủy lắng nghe sự kiện
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.listeners.get(event)?.size === 0) {
        this.listeners.delete(event);
      }
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
