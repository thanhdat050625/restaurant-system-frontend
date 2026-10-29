import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, LucideIcon } from 'lucide-react';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string> {
  value: T | '' | null | undefined;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  /** Mặc định bật khi có hơn 8 lựa chọn */
  searchable?: boolean;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  /** 'auto': theo Light/Dark của site; 'light': luôn sáng (trang quản trị chưa hỗ trợ Dark Mode) */
  tone?: 'auto' | 'light';
  /** 'ghost': không viền/nền, dùng cho bộ chọn nằm trong thanh tiêu đề */
  variant?: 'default' | 'ghost';
  invalid?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  onBlur?: () => void;
}

const PANEL_MAX_HEIGHT = 288;
const GAP = 6;

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

const toneClasses = {
  auto: {
    trigger: 'bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-text-primary dark:text-white',
    placeholder: 'text-text-light',
    panel: 'bg-white dark:bg-dark-surface border-light-border dark:border-dark-border',
    search: 'bg-light dark:bg-dark border-light-border dark:border-dark-border text-text-primary dark:text-white',
    option: 'text-text-primary dark:text-gray-200',
    active: 'bg-primary/10 text-primary dark:text-primary-light',
    muted: 'text-text-secondary dark:text-text-light',
  },
  light: {
    trigger: 'bg-white border-gray-300 text-gray-900',
    placeholder: 'text-gray-400',
    panel: 'bg-white border-gray-200',
    search: 'bg-gray-50 border-gray-200 text-gray-900',
    option: 'text-gray-800',
    active: 'bg-primary/10 text-primary',
    muted: 'text-gray-500',
  },
};

/**
 * Dropdown tùy biến thay cho thẻ <select> gốc (danh sách gốc do hệ điều hành vẽ, không style được).
 * Hỗ trợ bàn phím (↑ ↓ Enter Esc Home End, gõ chữ để nhảy), tìm kiếm không dấu, tự lật lên khi thiếu chỗ.
 */
export function Select<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  disabled = false,
  searchable,
  icon: Icon,
  size = 'md',
  tone = 'auto',
  variant = 'default',
  invalid = false,
  className = '',
  id,
  name,
  'aria-label': ariaLabel,
  onBlur,
}: SelectProps<T>) {
  const t = toneClasses[tone];
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<{ left: number; width: number; top?: number; bottom?: number }>({
    left: 0,
    width: 0,
  });

  const isSearchable = searchable ?? options.length > 8;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!isSearchable || !query.trim()) return options;
    const q = normalize(query.trim());
    return options.filter((o) => normalize(o.label).includes(q));
  }, [options, query, isSearchable]);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(rect.width, 200);
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < PANEL_MAX_HEIGHT + 60 && rect.top > spaceBelow;
    setPosition(
      openUp
        ? { left, width, bottom: window.innerHeight - rect.top + GAP }
        : { left, width, top: rect.bottom + GAP },
    );
  }, []);

  const openMenu = () => {
    if (disabled) return;
    updatePosition();
    setQuery('');
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : options.findIndex((o) => !o.disabled));
    setOpen(true);
  };

  const closeMenu = (focusTrigger = true) => {
    setOpen(false);
    onBlur?.();
    if (focusTrigger) triggerRef.current?.focus();
  };

  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return;
    if (option.value !== value) onChange(option.value);
    closeMenu();
  };

  useLayoutEffect(() => {
    if (!open) return;
    if (isSearchable) searchRef.current?.focus();
    else listRef.current?.focus();
  }, [open, isSearchable]);

  // Giữ panel bám theo nút khi cuộn/đổi kích thước; đóng khi bấm ra ngoài
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) closeMenu(false);
    };
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handlePointer);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handlePointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  useEffect(() => {
    if (open) setActiveIndex(filtered.findIndex((o) => !o.disabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const moveActive = (step: 1 | -1, from = activeIndex) => {
    if (filtered.length === 0) return;
    let next = from;
    for (let i = 0; i < filtered.length; i++) {
      next = (next + step + filtered.length) % filtered.length;
      if (!filtered[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        moveActive(1, -1);
        break;
      case 'End':
        e.preventDefault();
        moveActive(-1, filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[activeIndex]) choose(filtered[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu(false);
        break;
      default:
        // Gõ một chữ cái để nhảy tới lựa chọn bắt đầu bằng chữ đó
        if (!isSearchable && e.key.length === 1) {
          const ch = normalize(e.key);
          const start = activeIndex + 1;
          const order = [...filtered.slice(start), ...filtered.slice(0, start)];
          const hit = order.find((o) => !o.disabled && normalize(o.label).startsWith(ch));
          if (hit) setActiveIndex(filtered.indexOf(hit));
        }
    }
  };

  const sizeClass = size === 'sm' ? 'px-3 py-2 text-sm rounded-lg' : 'px-4 py-3 text-sm rounded-xl';
  const triggerClass =
    variant === 'ghost'
      ? 'bg-transparent border-transparent font-semibold px-1 py-1 text-sm rounded-lg'
      : `${t.trigger} ${sizeClass} border shadow-sm`;
  const ringClass = invalid
    ? 'border-error ring-2 ring-error/20'
    : open
      ? 'border-primary ring-2 ring-primary/25'
      : variant === 'ghost'
        ? ''
        : 'hover:border-primary/60';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full flex items-center gap-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed ${triggerClass} ${ringClass}`}
      >
        {Icon && <Icon size={17} className="text-primary shrink-0" />}
        <span className={`flex-1 truncate ${selected ? '' : t.placeholder}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : t.placeholder}`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: position.bottom !== undefined ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              style={{ position: 'fixed', left: position.left, width: position.width, top: position.top, bottom: position.bottom }}
              className={`z-[1000] rounded-xl border shadow-card-hover overflow-hidden ${t.panel}`}
              onKeyDown={handlePanelKeyDown}
            >
              {isSearchable && (
                <div className="p-2 border-b border-inherit">
                  <div className="relative">
                    <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.placeholder}`} />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      aria-controls={listId}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${t.search}`}
                    />
                  </div>
                </div>
              )}

              <ul
                ref={listRef}
                id={listId}
                role="listbox"
                tabIndex={-1}
                aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                style={{ maxHeight: PANEL_MAX_HEIGHT - (isSearchable ? 56 : 0) }}
                className="overflow-y-auto p-1.5 focus:outline-none"
              >
                {filtered.length === 0 ? (
                  <li className={`px-3 py-6 text-center text-sm ${t.muted}`}>Không có kết quả phù hợp</li>
                ) : (
                  filtered.map((option, index) => {
                    const isSelected = option.value === value;
                    const isActive = index === activeIndex;
                    return (
                      <li
                        key={String(option.value)}
                        id={`${listId}-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                        onClick={() => choose(option)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          option.disabled
                            ? `opacity-40 cursor-not-allowed ${t.option}`
                            : `cursor-pointer ${isActive ? t.active : t.option}`
                        } ${isSelected ? 'font-semibold' : ''}`}
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block truncate">{option.label}</span>
                          {option.description && (
                            <span className={`block text-xs truncate font-normal ${t.muted}`}>{option.description}</span>
                          )}
                        </span>
                        {isSelected && <Check size={16} className="text-primary shrink-0" />}
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export default Select;
