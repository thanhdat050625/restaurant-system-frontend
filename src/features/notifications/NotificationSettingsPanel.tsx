import React from 'react';
import {
  Bell,
  CalendarCheck,
  ChefHat,
  CreditCard,
  Mail,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Volume2,
  VolumeX,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { useNotifications } from './NotificationContext';
import { IUpdateNotificationPreferencesDto } from '../../types/notification.type';

interface ToggleRowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  icon: Icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-100 dark:border-dark-border last:border-0">
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
        checked ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const NotificationSettingsPanel: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const { user } = useAuth();
  const {
    preferences,
    soundEnabled,
    isSavingPreferences,
    toggleSound,
    updatePreferences,
  } = useNotifications();

  const isCustomer = !user?.role || user.role === 'USER';
  const isStaffOrKitchen = user?.role === 'STAFF' || user?.role === 'KITCHEN';

  const handleUpdate = async (
    dto: IUpdateNotificationPreferencesDto,
    successMessage: string,
  ) => {
    try {
      await updatePreferences(dto);
      toast.success(successMessage);
    } catch {
      toast.error('Không thể lưu cài đặt thông báo.');
    }
  };

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {!compact && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="text-primary" size={22} />
            <span>Cài đặt thông báo</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tùy chỉnh các loại thông báo qua chuông trên web, âm thanh cảnh báo và email tự động từ FoodHub.
          </p>
        </div>
      )}

      {/* Khối 1: Âm thanh chuông */}
      <div className="bg-gray-50/70 dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Âm thanh chuông cảnh báo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Phát tiếng chuông ngay khi có thông báo mới trên web (không cần tải lại trang).
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={toggleSound}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              soundEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Khối 2: Thông báo trên Web (Chuông & Popup) */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-4 sm:p-5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
          Thông báo trên Web (Chuông & Popup)
        </h3>

        <ToggleRow
          icon={CalendarCheck}
          title="Đặt bàn & Lịch hẹn"
          description={
            isCustomer
              ? 'Xác nhận bàn, hủy/vắng mặt, nhắc lịch hẹn trước 2 tiếng và hoàn tất bữa ăn.'
              : 'Khách vừa đặt bàn mới, khách hủy đặt bàn hoặc thay đổi món đặt trước.'
          }
          checked={preferences.inApp.reservation}
          disabled={isSavingPreferences}
          onChange={(val) =>
            void handleUpdate(
              { inApp: { reservation: val } },
              val ? 'Đã bật thông báo đặt bàn.' : 'Đã tắt thông báo đặt bàn.',
            )
          }
        />

        <ToggleRow
          icon={ShoppingBag}
          title="Đơn món ăn đến lấy (Mang về)"
          description={
            isCustomer
              ? 'Xác nhận đơn, bếp đang chế biến, nhắc trước 30 phút và báo ngay khi món đã sẵn sàng.'
              : 'Đơn đặt món mang về mới, trạng thái bếp làm xong và khách hủy đơn.'
          }
          checked={preferences.inApp.pickup}
          disabled={isSavingPreferences}
          onChange={(val) =>
            void handleUpdate(
              { inApp: { pickup: val } },
              val ? 'Đã bật thông báo đơn mang về.' : 'Đã tắt thông báo đơn mang về.',
            )
          }
        />

        {!isCustomer && (
          <ToggleRow
            icon={ChefHat}
            title="Vận hành Bếp & Phục vụ tại bàn"
            description="Đợt gọi món mới, món đã chế biến xong cần bưng ra, khách yêu cầu thanh toán và nhắc dọn bàn."
            checked={preferences.inApp.kitchen}
            disabled={isSavingPreferences}
            onChange={(val) =>
              void handleUpdate(
                { inApp: { kitchen: val } },
                val ? 'Đã bật thông báo bếp & bàn ăn.' : 'Đã tắt thông báo bếp & bàn ăn.',
              )
            }
          />
        )}

        <ToggleRow
          icon={CreditCard}
          title="Thanh toán & Hoàn tiền"
          description="Cập nhật giao dịch thanh toán thất bại hoặc hoàn tiền đặt cọc / đơn mang về."
          checked={preferences.inApp.payment}
          disabled={isSavingPreferences}
          onChange={(val) =>
            void handleUpdate(
              { inApp: { payment: val } },
              val ? 'Đã bật thông báo thanh toán.' : 'Đã tắt thông báo thanh toán.',
            )
          }
        />

        <ToggleRow
          icon={ShieldCheck}
          title="Đăng nhập & Bảo mật"
          description="Lời chào đăng nhập mỗi ngày 1 lần, cảnh báo đăng nhập từ thiết bị lạ và thay đổi mật khẩu."
          checked={preferences.inApp.security}
          disabled={isSavingPreferences}
          onChange={(val) =>
            void handleUpdate(
              { inApp: { security: val } },
              val ? 'Đã bật thông báo đăng nhập & bảo mật.' : 'Đã tắt thông báo đăng nhập & bảo mật.',
            )
          }
        />

        {isStaffOrKitchen && (
          <ToggleRow
            icon={UserCog}
            title="Tài khoản nhân sự"
            description="Thông báo điều chuyển chi nhánh làm việc, cấp lại mật khẩu hoặc trạng thái tài khoản."
            checked={preferences.inApp.account}
            disabled={isSavingPreferences}
            onChange={(val) =>
              void handleUpdate(
                { inApp: { account: val } },
                val ? 'Đã bật thông báo tài khoản.' : 'Đã tắt thông báo tài khoản.',
              )
            }
          />
        )}
      </div>

      {/* Khối 3: Thông báo qua Email (chỉ áp dụng cho khách hàng / người đặt) */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Mail size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Thông báo qua Email
          </h3>
        </div>

        <ToggleRow
          icon={CalendarCheck}
          title="Email Đặt bàn & Nhắc lịch trước 2 tiếng"
          description="Gửi email xác nhận đặt bàn đính kèm mã QR Check-in và email nhắc lịch hẹn trước 2 tiếng."
          checked={preferences.email.reservation}
          disabled={isSavingPreferences}
          onChange={(val) =>
            void handleUpdate(
              { email: { reservation: val } },
              val ? 'Đã bật email đặt bàn.' : 'Đã tắt email đặt bàn.',
            )
          }
        />

        <ToggleRow
          icon={ShoppingBag}
          title="Email Đơn mang về (Đặt thành công, Đang làm, Nhắc 30', Sẵn sàng)"
          description="Gửi email hóa đơn khi đặt, báo bếp đang làm món, nhắc trước 30 phút và báo ngay khi món đã sẵn sàng."
          checked={preferences.email.pickup}
          disabled={isSavingPreferences}
          onChange={(val) =>
            void handleUpdate(
              { email: { pickup: val } },
              val ? 'Đã bật email đơn mang về.' : 'Đã tắt email đơn mang về.',
            )
          }
        />
      </div>
    </div>
  );
};

export default NotificationSettingsPanel;
