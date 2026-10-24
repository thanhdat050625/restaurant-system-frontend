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

class SocketService {
  private socket: Socket | null = null;
  private currentBranchId: string | null = null;

  /**
   * Khởi tạo kết nối Socket.IO
   */
  connect(token?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

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
   * Gửi yêu cầu giữ bàn tạm thời (Table Lock)
   */
  lockTable(branchId: string, tableId: string) {
    if (this.socket) {
      this.socket.emit('table:lock', { branchId, tableId });
    }
  }

  /**
   * Gửi yêu cầu nhả bàn (Table Release)
   */
  releaseTable(branchId: string, tableId: string) {
    if (this.socket) {
      this.socket.emit('table:release', { branchId, tableId });
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
