import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import ErrorBoundary from './ErrorBoundary';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
}

const ScannerView: React.FC<{
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}> = ({ onScanSuccess, onClose }) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onCloseRef = useRef(onClose);

  // Luôn cập nhật ref cho callback
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onCloseRef.current = onClose;
  }, [onScanSuccess, onClose]);

  useEffect(() => {
    isDestroyedRef.current = false;
    const uniqueId = `qr-reader-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Tạo phần tử DOM độc lập bên ngoài cây Virtual DOM của React
    // để tránh lỗi React "Failed to execute removeChild on Node" khi unmount nhanh
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const readerDiv = document.createElement('div');
    readerDiv.id = uniqueId;
    readerDiv.style.width = '100%';
    containerRef.current.appendChild(readerDiv);

    const safelyCleanUp = async (scanner: Html5Qrcode) => {
      try {
        if (scanner.isScanning) {
          await scanner.stop().catch(() => {});
        }
      } catch {
        // Bỏ qua lỗi stop khi không trong trạng thái scanning
      }
      try {
        scanner.clear();
      } catch {
        // Bỏ qua lỗi clear
      }
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      } catch {
        // Bỏ qua lỗi DOM
      }
    };

    const startScanner = async () => {
      try {
        setIsStarting(true);
        isStartingRef.current = true;
        const html5QrCode = new Html5Qrcode(uniqueId, false);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isDestroyedRef.current) {
              onScanSuccessRef.current(decodedText);
              onCloseRef.current();
            }
          },
          () => {
            // Frame error - bỏ qua
          }
        );

        isStartingRef.current = false;
        if (isDestroyedRef.current) {
          // Người dùng đã click ra ngoài / đóng modal trong lúc camera đang khởi động
          safelyCleanUp(html5QrCode);
        } else {
          setIsStarting(false);
        }
      } catch (err: any) {
        isStartingRef.current = false;
        if (!isDestroyedRef.current) {
          setScannerError(
            err?.message ||
              'Không thể truy cập camera. Vui lòng cấp quyền hoặc kiểm tra thiết bị có camera.'
          );
          setIsStarting(false);
        }
      }
    };

    // Đợi 200ms sau khi modal mở xong để DOM sẵn sàng
    const timer = setTimeout(() => {
      if (!isDestroyedRef.current) {
        startScanner();
      }
    }, 200);

    return () => {
      isDestroyedRef.current = true;
      clearTimeout(timer);
      const scanner = scannerRef.current;
      if (scanner) {
        if (!isStartingRef.current) {
          safelyCleanUp(scanner);
        }
        // Nếu isStartingRef.current = true thì khối startScanner() sẽ tự động gọi safelyCleanUp khi start xong
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Hướng camera của thiết bị vào mã QR trên điện thoại của khách hàng để tự động xác thực và bàn giao món.
      </p>

      {scannerError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold">Lỗi khởi động camera:</p>
            <p>{scannerError}</p>
            <p className="mt-1 text-gray-500">
              Gợi ý: Nếu không có camera hoặc trình duyệt chặn quyền, bạn có thể nhập trực tiếp mã đơn (PU-...) vào ô bên cạnh.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[300px]">
          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 gap-2">
              <RefreshCw size={24} className="animate-spin text-primary" />
              <span className="text-xs">Đang mở camera...</span>
            </div>
          )}
          {/* Container DOM độc lập không bị React reconciliation kiểm soát */}
          <div ref={containerRef} className="w-full max-w-[360px]" />
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Quét mã QR nhận món',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <ErrorBoundary
        fallback={
          <div className="p-6 text-center space-y-3">
            <p className="text-xs text-gray-600">Đã đóng luồng camera.</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
            >
              Đóng
            </button>
          </div>
        }
      >
        {isOpen && <ScannerView onScanSuccess={onScanSuccess} onClose={onClose} />}
      </ErrorBoundary>
    </Modal>
  );
};

export default QrScannerModal;
