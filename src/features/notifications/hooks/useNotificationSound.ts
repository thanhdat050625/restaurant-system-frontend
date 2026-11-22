import { useCallback, useEffect, useRef, useState } from 'react';

const SOUND_STORAGE_KEY = 'foodhub-notification-sound';

export type NotificationSoundKind =
  | 'staff_created'
  | 'staff_cancelled'
  | 'kitchen'
  | 'alert'
  | 'customer';

interface ToneStep {
  freq: number;
  startOffset: number;
  duration: number;
  gain: number;
  type?: OscillatorType;
}

const SOUND_PATTERNS: Record<NotificationSoundKind, ToneStep[]> = {
  // Chuông báo đơn mới (đặt bàn mới / đơn mang về mới)
  staff_created: [
    { freq: 659.25, startOffset: 0, duration: 0.14, gain: 0.22, type: 'sine' },
    { freq: 880.0, startOffset: 0.14, duration: 0.16, gain: 0.24, type: 'sine' },
    { freq: 1108.73, startOffset: 0.3, duration: 0.28, gain: 0.22, type: 'triangle' },
  ],
  // Chuông cảnh báo hủy đơn / hết hạn / lỗi
  staff_cancelled: [
    { freq: 783.99, startOffset: 0, duration: 0.15, gain: 0.24, type: 'triangle' },
    { freq: 587.33, startOffset: 0.16, duration: 0.18, gain: 0.24, type: 'triangle' },
    { freq: 440.0, startOffset: 0.35, duration: 0.28, gain: 0.22, type: 'sine' },
  ],
  // Chuông bếp / bưng món / yêu cầu thanh toán bàn
  kitchen: [
    { freq: 783.99, startOffset: 0, duration: 0.12, gain: 0.22, type: 'triangle' },
    { freq: 1046.5, startOffset: 0.13, duration: 0.24, gain: 0.24, type: 'sine' },
  ],
  // Chuông cảnh báo bảo mật / quá giờ
  alert: [
    { freq: 880.0, startOffset: 0, duration: 0.12, gain: 0.2, type: 'triangle' },
    { freq: 698.46, startOffset: 0.14, duration: 0.2, gain: 0.2, type: 'triangle' },
  ],
  // Chuông nhẹ nhàng cho khách hàng
  customer: [
    { freq: 587.33, startOffset: 0, duration: 0.14, gain: 0.18, type: 'sine' },
    { freq: 880.0, startOffset: 0.14, duration: 0.26, gain: 0.2, type: 'sine' },
  ],
};

export function useNotificationSound() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioCtx();
      } catch {
        return null;
      }
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    const unlock = () => {
      ensureAudioContext();
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [ensureAudioContext]);

  const playSound = useCallback(
    (kind: NotificationSoundKind = 'customer', force = false) => {
      if (!force && !soundEnabledRef.current) return;
      const ctx = ensureAudioContext();
      if (!ctx) return;

      const steps = SOUND_PATTERNS[kind] || SOUND_PATTERNS.customer;
      const now = ctx.currentTime;

      steps.forEach((step) => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = step.type || 'sine';
          osc.frequency.setValueAtTime(step.freq, now + step.startOffset);

          gainNode.gain.setValueAtTime(0.001, now + step.startOffset);
          gainNode.gain.exponentialRampToValueAtTime(
            step.gain,
            now + step.startOffset + 0.02,
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            now + step.startOffset + step.duration,
          );

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + step.startOffset);
          osc.stop(now + step.startOffset + step.duration + 0.02);
        } catch {
          // Bỏ qua nếu trình duyệt chặn autoplay
        }
      });
    },
    [ensureAudioContext],
  );

  const syncSoundEnabled = useCallback((value: boolean) => {
    setSoundEnabled(value);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(value));
    } catch {}
  }, []);

  const toggleSound = useCallback((): boolean => {
    const next = !soundEnabledRef.current;
    syncSoundEnabled(next);
    if (next) {
      setTimeout(() => playSound('customer', true), 40);
    }
    return next;
  }, [playSound, syncSoundEnabled]);

  return {
    soundEnabled,
    syncSoundEnabled,
    toggleSound,
    playSound,
  };
}
