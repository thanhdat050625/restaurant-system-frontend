import React from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

/** Class dùng chung cho các bước đặt bàn (theo design token của site, hỗ trợ Light/Dark) */
export const ui = {
  card: 'bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-card',
  label: 'block text-xs font-medium text-text-secondary dark:text-text-light mb-1.5',
  input:
    'w-full px-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-light dark:bg-dark text-sm text-text-primary dark:text-white placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
  muted: 'text-text-secondary dark:text-text-light',
  heading: 'text-text-primary dark:text-white',
};

/** Tiêu đề từng khối nội dung trong một bước */
export const SectionTitle: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}> = ({ icon: Icon, title, description, aside }) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon size={19} />
      </div>
      <div>
        <h3 className={`text-base font-semibold ${ui.heading}`}>{title}</h3>
        {description && <p className={`text-xs mt-0.5 ${ui.muted}`}>{description}</p>}
      </div>
    </div>
    {aside}
  </div>
);

/** Thanh nút Quay lại / Tiếp tục ở cuối mỗi bước */
export const StepActions: React.FC<{
  onBack?: () => void;
  onNext: () => void;
  nextLabel: React.ReactNode;
  nextIcon?: LucideIcon;
  nextDisabled?: boolean;
  isLoading?: boolean;
}> = ({ onBack, onNext, nextLabel, nextIcon: NextIcon = ChevronRight, nextDisabled, isLoading }) => (
  <div className="flex gap-3 pt-1">
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl border border-light-border dark:border-dark-border text-sm font-semibold text-text-secondary dark:text-gray-200 bg-white dark:bg-dark-surface hover:bg-light-card dark:hover:bg-dark-card transition-colors disabled:opacity-50"
      >
        <ChevronLeft size={17} />
        Quay lại
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={nextDisabled || isLoading}
      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        NextIcon !== ChevronRight && <NextIcon size={17} />
      )}
      <span>{nextLabel}</span>
      {!isLoading && NextIcon === ChevronRight && <ChevronRight size={17} />}
    </button>
  </div>
);

/** 'YYYY-MM-DD' -> 'Thứ Sáu, 30/10/2026' */
export const formatReservationDate = (date: string) => {
  if (!date) return '';
  const label = new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};
