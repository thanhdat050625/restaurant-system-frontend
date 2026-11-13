import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Copy, Check, ExternalLink, MapPin, Users, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { ITable } from '../../types/admin/table.type';

export interface TableQRTarget {
  id: string;
  tableNumber: string;
  floor: number;
  branch?: { id?: string; name?: string } | null;
  tableType?: { id?: string; name?: string; capacity?: number } | null;
}

interface TableQRModalProps {
  table: ITable | TableQRTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TableQRModal: React.FC<TableQRModalProps> = ({ table, isOpen, onClose }) => {
  const [customOrigin, setCustomOrigin] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomOrigin(window.location.origin);
      setCopied(false);
    }
  }, [isOpen, table?.id]);

  if (!table) return null;

  const cleanOrigin = (customOrigin || window.location.origin).trim().replace(/\/+$/, '');
  const tableOrderPath = `/table-order/${table.id}`;
  const fullOrderUrl = `${cleanOrigin}${tableOrderPath}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    fullOrderUrl,
  )}&margin=12`;

  const isLocalhost = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullOrderUrl);
      setCopied(true);
      toast.success('Đã sao chép đường dẫn gọi món của bàn!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể tự động sao chép. Vui lòng bôi đen và copy thủ công.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mã QR Gọi Món — ${table.tableNumber}`}
      subtitle="Dùng điện thoại quét mã này tại bàn để mở thực đơn và gọi món trực tiếp xuống Bếp"
      size="sm"
    >
      <div className="space-y-4 text-center">
        {/* Khung hiển thị QR */}
        <div className="inline-flex flex-col items-center p-4 bg-white rounded-2xl border-2 border-gray-200 dark:border-slate-700 shadow-sm">
          <img
            src={qrImageUrl}
            alt={`Mã QR ${table.tableNumber}`}
            className="w-56 h-56 object-contain"
          />
          <div className="mt-2 pt-2 border-t border-gray-100 w-full flex items-center justify-center gap-1.5 text-gray-800">
            <QrCode size={15} className="text-primary" />
            <span className="font-extrabold text-sm tracking-wide uppercase">
              {table.tableNumber} • Tầng {table.floor}
            </span>
          </div>
        </div>

        {/* Thông tin cơ bản của bàn */}
        <div className="bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 text-left text-xs space-y-2 text-gray-700 dark:text-gray-200">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <MapPin size={14} className="text-primary shrink-0" />
              Chi nhánh:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {table.branch?.name || 'Chi nhánh hiện tại'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Users size={14} className="text-primary shrink-0" />
              Loại bàn / Sức chứa:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {table.tableType?.name || 'Tiêu chuẩn'} ({table.tableType?.capacity || 4} chỗ)
            </span>
          </div>
        </div>

        {/* Tùy chỉnh Domain/IP khi test qua điện thoại nội bộ */}
        <div className="text-left space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <Globe size={13} className="text-primary" />
            <span>Địa chỉ gốc QR (Domain / IP LAN / Tunnel)</span>
          </label>
          <input
            type="text"
            value={customOrigin}
            onChange={(e) => setCustomOrigin(e.target.value)}
            placeholder="Ví dụ: http://192.168.1.15:5173"
            className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
          />
          {isLocalhost && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
              Lưu ý: Đang dùng <code className="font-mono font-bold">localhost</code>. Nếu quét bằng điện thoại thật, hãy thay bằng IP LAN hoặc URL Ngrok/Deploy.
            </p>
          )}
        </div>

        {/* Đường dẫn & Các nút thao tác */}
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <span className="text-[11px] font-mono text-gray-600 dark:text-gray-300 truncate flex-1 text-left px-1">
            {fullOrderUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-gray-200 dark:border-slate-600 shrink-0 transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            <span>{copied ? 'Đã chép' : 'Copy'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link
            to={tableOrderPath}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <ExternalLink size={14} />
            <span>Mở trang gọi món</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TableQRModal;

