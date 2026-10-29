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
  private currentBranchId: string | null = null;
  private authKey: string | null = null;

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

    this.socket.on('connect', () => {
      console.log('⚡ [Socket] Connected to server:', this.socket?.id);
      // Re-join current branch room if reconnected
      if (this.currentBranchId) {
        this.joinBranch(this.currentBranchId);
      }
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
      if (this.currentBranchId) {
        this.leaveBranch(this.currentBranchId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.currentBranchId = null;
      this.authKey = null;
    }
  }

  /**
   * Tham gia phòng chi nhánh để nhận broadcast thời gian thực
   */
  joinBranch(branchId: string) {
    this.currentBranchId = branchId;
    if (this.socket) {
      this.socket.emit('branch:join', { branchId });
    }
  }

  /**
   * Rời khỏi phòng chi nhánh
   */
  leaveBranch(branchId: string) {
    if (this.socket) {
      this.socket.emit('branch:leave', { branchId });
      if (this.currentBranchId === branchId) {
        this.currentBranchId = null;
      }
    }
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
    this.socket?.on(event, callback);
  }

  /**
   * Hủy lắng nghe sự kiện
   */
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
