import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  Receipt,
  RefreshCw,
  MapPin,
  Users,
  Sun,
  Moon,
  ArrowLeft,
  AlertCircle,
  Wifi,
  WifiOff,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dineInService } from '../../services/dineInService';
import { socketService } from '../../services/socketService';
import { useTheme } from '../../hooks/ThemeContext';
import {
  IDineInMenuItem,
  IDineInOrderBatch,
  IDineInTableInfo,
  IInvoice,
} from '../../types/dine-in.type';
import { formatPrice } from '../../utils/helpers';
import { DineInMenuTab } from './DineInMenuTab';
import { DineInInvoiceTab } from './DineInInvoiceTab';

type ActiveTab = 'MENU' | 'INVOICE';

const statusTextMap: Record<string, string> = {
  AVAILABLE: 'Sẵn sàng phục vụ',
  OCCUPIED: 'Đang có khách',
  DIRTY: 'Chờ dọn dẹp',
  MAINTENANCE: 'Đang bảo trì',
};

export const TableOrderPage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<ActiveTab>('MENU');
  const [table, setTable] = useState<IDineInTableInfo | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<IInvoice | null>(null);
  const [menu, setMenu] = useState<IDineInMenuItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [invoiceJustClosed, setInvoiceJustClosed] = useState(false);

  const fetchSession = useCallback(
    async (showLoader = true) => {
      if (!tableId) return;
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setErrorMsg(null);
      try {
        const res = await dineInService.getTableSession(tableId);
        setTable(res.data.table);
        setActiveInvoice(res.data.activeInvoice);
        setMenu(res.data.menu || []);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
        const rawMsg = axiosErr?.response?.data?.message;
        const msg = Array.isArray(rawMsg)
          ? rawMsg.join(', ')
          : rawMsg || axiosErr?.message || 'Không thể tải thông tin bàn ăn.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tableId],
  );

  useEffect(() => {
    fetchSession(true);
  }, [fetchSession]);

  const branchId = table?.branch?.id;

  useEffect(() => {
    if (!tableId) return;

    const socket = socketService.connect();
    setSocketConnected(Boolean(socket.connected));

    socketService.joinTable(tableId);
    if (branchId) {
      socketService.joinBranch(branchId);
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleBatchCreated = () => {
      setInvoiceJustClosed(false);
      fetchSession(false);
    };

    const handleItemStatusChanged = (payload?: {
      menuItemName?: string;
      status?: string;
    }) => {
      if (payload?.status === 'READY' && payload?.menuItemName) {
        toast.success(`Món "${payload.menuItemName}" đã làm xong và chuẩn bị mang ra bàn!`, {
          duration: 4500,
        });
      }
      fetchSession(false);
    };

    const handleBillUpdated = () => {
      fetchSession(false);
    };

    const handlePaymentRequested = () => {
      fetchSession(false);
    };

    const handleInvoiceClosed = () => {
      setInvoiceJustClosed(true);
      toast.success('Hóa đơn bàn đã được thanh toán hoàn tất. Cảm ơn quý khách!');
      fetchSession(false);
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('table:batch_created', handleBatchCreated);
    socketService.on('table:item_status_changed', handleItemStatusChanged);
    socketService.on('table:bill_updated', handleBillUpdated);
    socketService.on('table:payment_requested', handlePaymentRequested);
    socketService.on('table:invoice_closed', handleInvoiceClosed);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('table:batch_created', handleBatchCreated);
      socketService.off('table:item_status_changed', handleItemStatusChanged);
      socketService.off('table:bill_updated', handleBillUpdated);
      socketService.off('table:payment_requested', handlePaymentRequested);
      socketService.off('table:invoice_closed', handleInvoiceClosed);
      socketService.leaveTable(tableId);
      if (branchId) {
        socketService.leaveBranch(branchId);
      }
    };
  }, [tableId, branchId, fetchSession]);

  const orderedItemsCount = useMemo(() => {
    if (!activeInvoice?.batches) return 0;
    return activeInvoice.batches.reduce(
      (sum, b) =>
        sum +
        b.items.reduce(
          (iSum, it) => (it.status === 'CANCELLED' ? iSum : iSum + it.quantity),
          0,
        ),
      0,
    );
  }, [activeInvoice]);

  const handleOrderSubmitted = (_updatedInvoice: IInvoice, _batch: IDineInOrderBatch) => {
    setInvoiceJustClosed(false);
    fetchSession(false);
    setActiveTab('INVOICE');
  };

  const handlePaymentRequested = (updatedInvoice: IInvoice) => {
    setActiveInvoice(updatedInvoice);
    fetchSession(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Đang mở thực đơn bàn ăn...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !table) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
              Không tìm thấy thông tin bàn
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {errorMsg || 'Mã QR bàn không hợp lệ hoặc phiên đã hết hạn.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs font-semibold"
            >
              Về trang chủ
            </Link>
            <button
              type="button"
              onClick={() => fetchSession(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                to="/"
                title="Trang chủ"
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-primary shrink-0"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white truncate">
                    {table.tableNumber}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    Tầng {table.floor}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      socketConnected
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400'
                    }`}
                  >
                    {socketConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {socketConnected ? 'Realtime' : 'Ngoại tuyến'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                  <MapPin size={12} className="shrink-0 text-primary" />
                  <span className="truncate">{table.branch?.name}</span>
                  {table.capacity && (
                    <span className="inline-flex items-center gap-0.5 shrink-0">
                      • <Users size={11} /> {table.capacity} chỗ
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Đổi giao diện Sáng/Tối"
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button
                type="button"
                onClick={() => fetchSession(false)}
                disabled={refreshing}
                aria-label="Làm mới dữ liệu"
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Active Table Context Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <UserCheck size={14} className="text-primary shrink-0" />
              {activeInvoice ? (
                <span className="truncate text-gray-700 dark:text-gray-200">
                  Khách: <strong>{activeInvoice.customerName}</strong> • Mã HĐ:{' '}
                  <strong className="font-mono text-primary">{activeInvoice.invoiceCode}</strong>
                </span>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">
                  Trạng thái: <strong>{statusTextMap[table.status] || table.status}</strong> — Chọn món để bắt đầu phục vụ
                </span>
              )}
            </div>
            {activeInvoice && (
              <span className="font-extrabold text-primary shrink-0">
                {formatPrice(Number(activeInvoice.finalAmount || 0))}
              </span>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('MENU')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'MENU'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <UtensilsCrossed size={16} />
              <span>Thực đơn ({menu.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INVOICE')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'INVOICE'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <Receipt size={16} />
              <span>Đơn &amp; Hóa đơn</span>
              {orderedItemsCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'INVOICE'
                      ? 'bg-white text-primary'
                      : 'bg-primary text-white'
                  }`}
                >
                  {orderedItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {invoiceJustClosed && !activeInvoice && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={22} className="shrink-0" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-sm">Bữa ăn đã thanh toán hoàn tất!</p>
              <p>Cảm ơn quý khách đã dùng bữa tại {table.branch?.name}. Hẹn gặp lại!</p>
            </div>
          </div>
        )}

        {activeTab === 'MENU' ? (
          <DineInMenuTab
            table={table}
            menu={menu}
            activeInvoice={activeInvoice}
            onOrderSubmitted={handleOrderSubmitted}
          />
        ) : (
          <DineInInvoiceTab
            tableId={table.id}
            tableNumber={table.tableNumber}
            activeInvoice={activeInvoice}
            onSwitchToMenu={() => setActiveTab('MENU')}
            onPaymentRequested={handlePaymentRequested}
          />
        )}
      </main>
    </div>
  );
};
export default TableOrderPage;

