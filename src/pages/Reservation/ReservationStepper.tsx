import React from 'react';
import { Check } from 'lucide-react';
import { ui } from './reservationUi';

const STEPS = [
  { title: 'Thời gian', description: 'Chi nhánh, ngày & giờ' },
  { title: 'Chọn bàn', description: 'Vị trí trên sơ đồ' },
  { title: 'Gọi món', description: 'Tùy chọn' },
  { title: 'Xác nhận', description: 'Thông tin liên hệ' },
];

interface ReservationStepperProps {
  step: number;
  /** Chỉ cho phép quay lại các bước đã hoàn thành */
  onStepClick: (step: number) => void;
}

export const ReservationStepper: React.FC<ReservationStepperProps> = ({ step, onStepClick }) => (
  <nav aria-label="Các bước đặt bàn" className={`${ui.card} px-4 py-4 sm:px-6 sm:py-5`}>
    <ol className="flex items-start">
      {STEPS.map((s, idx) => {
        const index = idx + 1;
        const isDone = step > index;
        const isCurrent = step === index;

        return (
          <li key={s.title} className="flex-1 flex items-start last:flex-none">
            <button
              type="button"
              disabled={!isDone}
              onClick={() => onStepClick(index)}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left disabled:cursor-default group"
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  isDone
                    ? 'bg-success text-white group-hover:ring-4 group-hover:ring-success/20'
                    : isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-light-card dark:bg-dark-card text-text-light'
                }`}
              >
                {isDone ? <Check size={17} strokeWidth={3} /> : index}
              </span>
              <span className="hidden sm:block">
                <span
                  className={`block text-sm font-semibold ${
                    isCurrent ? 'text-primary' : isDone ? ui.heading : 'text-text-light'
                  }`}
                >
                  {s.title}
                </span>
                <span className="block text-[11px] text-text-light">{s.description}</span>
              </span>
              <span
                className={`sm:hidden text-[11px] font-semibold ${isCurrent ? 'text-primary' : 'text-text-light'}`}
              >
                {s.title}
              </span>
            </button>
            {index < STEPS.length && (
              <span
                aria-hidden
                className={`flex-1 h-0.5 mt-[18px] mx-2 sm:mx-4 rounded-full transition-colors ${
                  isDone ? 'bg-success' : 'bg-light-border dark:bg-dark-border'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
