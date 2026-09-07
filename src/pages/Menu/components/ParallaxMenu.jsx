import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Plus, ShoppingBag, ChevronDown, ChevronUp, X } from 'lucide-react';
import { menuItems } from '../../../assets/data/menuData';
import { useCart } from '../../../features/menu/CartContext';
import { formatPrice } from '../../../utils/helpers';

// ─── SLIDE ──────────────────────────────────────────────────────────────────
const Slide = ({ item, isActive, isPrev, onAddToCart, onOpenDetail, isAdding }) => {
  // Determine position: active = 0%, prev (above) = -100%, next (below) = +100%
  // We only animate bg + content, position is handled by parent
  return (
    <div className="relative w-full h-full flex items-end justify-start overflow-hidden">
      {/* Full-screen background — always rendered, animates independently */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          scale: isActive ? 1.0 : 1.06,
          filter: isActive ? 'brightness(0.9) blur(0px)' : 'brightness(0.5) blur(6px)',
        }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={item.image} alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Gradient */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.0) 80%)' }}
      />

      {/* Content — slides in from bottom when active */}
      <motion.div
        className="relative z-20 w-full px-8 md:px-20 pb-20 md:pb-24 text-white"
        animate={{
          opacity: isActive ? 1 : 0,
          y: isActive ? 0 : 32,
        }}
        transition={{ duration: 0.65, delay: isActive ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Badges */}
        <div className="flex gap-2 mb-4">
          {item.isPopular && <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">🔥 Best Seller</span>}
          {item.isNew && <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">✨ Mới</span>}
          {item.dietary?.map(d => (
            <span key={d} className="px-3 py-1 bg-white/10 text-white/90 text-xs rounded-full border border-white/15 backdrop-blur-sm">{d}</span>
          ))}
        </div>

        {/* Name */}
        <h2
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-3 leading-[1.05] tracking-tight"
          style={{ fontFamily: '"Palatino Linotype", Georgia, serif', textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
        >
          {item.name}
        </h2>

        {/* Description */}
        <p className="text-white/75 text-base md:text-lg font-light mb-7 max-w-2xl leading-relaxed">
          {item.description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-5 mb-8">
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Giá</span>
            <span className="text-3xl font-black text-primary" style={{ textShadow: '0 0 20px rgba(var(--color-primary-rgb, 234 88 12)/0.4)' }}>
              {formatPrice(item.price)}
            </span>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Đánh giá</span>
            <span className="flex items-center gap-1.5 text-xl font-bold">
              <Star size={18} className="text-amber-400 fill-amber-400" />{item.rating}
              <span className="text-sm text-white/35 font-normal">({item.reviewCount})</span>
            </span>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div className="flex flex-col">
            <span className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Thời gian</span>
            <span className="flex items-center gap-1 text-xl font-bold"><Clock size={18} />{item.preparationTime}<span className="text-sm font-normal ml-0.5">phút</span></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onAddToCart(item)}
            className="flex items-center gap-2.5 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-base rounded-full shadow-xl shadow-primary/30 transition-colors border border-white/10"
          >
            {isAdding ? <ShoppingBag size={20} className="animate-bounce" /> : <Plus size={20} />}
            {item.options?.length > 0 ? 'Tùy chọn & thêm' : 'Thêm vào giỏ'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenDetail(item)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/18 text-white font-medium text-base rounded-full backdrop-blur-sm border border-white/15 transition-all"
          >
            Xem chi tiết
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
const DetailPanel = ({ item, onClose, onAdd }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  return (
    <motion.div
      className="absolute inset-y-0 right-0 z-40 w-full sm:w-[400px] flex flex-col overflow-y-auto scrollbar-hide border-l border-white/10"
      style={{ background: 'rgba(10,6,3,0.92)', backdropFilter: 'blur(20px)' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-60 shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,6,3,0.95), transparent 60%)' }} />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-xl font-black text-white leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{item.name}</h3>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-1">
        <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
        <div className="flex gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" />{item.rating} ({item.reviewCount})</span>
          <span className="flex items-center gap-1"><Clock size={12} />{item.preparationTime} phút</span>
        </div>
        {item.dietary?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.dietary.map(d => <span key={d} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">{d}</span>)}
          </div>
        )}
        {item.options?.length > 0 && (
          <div>
            <p className="text-white/80 font-semibold mb-2 text-sm">Tuỳ chọn:</p>
            <div className="space-y-2">
              {item.options.map((opt, i) => (
                <button key={i} onClick={() => setSelectedOption(i)}
                  className={`w-full flex justify-between p-3 rounded-xl border transition-all text-sm ${selectedOption === i ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white/80'}`}>
                  <span>{opt.name}</span>
                  <span className={selectedOption === i ? 'text-primary' : 'text-white/40'}>{opt.priceAdd > 0 ? `+${formatPrice(opt.priceAdd)}` : 'Mặc định'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-2xl font-black text-primary">
            {formatPrice(item.price + (selectedOption !== null ? item.options[selectedOption]?.priceAdd || 0 : 0))}
          </span>
          <button
            onClick={() => { onAdd(item, selectedOption); onClose(); }}
            className="px-6 py-3 bg-primary rounded-full text-white font-bold hover:bg-primary-dark transition-all hover:scale-105 active:scale-95"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const ParallaxMenu = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAddingId, setIsAddingId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const { addItem } = useCart();

  const showcaseItems = [...menuItems].sort((a, b) => b.rating - a.rating).slice(0, 12);
  const total = showcaseItems.length;

  // ── Throttled navigation ────────────────────────────────────────────────────
  const isCooling = useRef(false);
  const cooldown = 750; // ms between transitions

  const goTo = useCallback((index) => {
    if (isCooling.current) return;
    const clamped = Math.max(0, Math.min(total - 1, index));
    setActiveIndex(clamped);
    isCooling.current = true;
    setTimeout(() => { isCooling.current = false; }, cooldown);
  }, [total]);

  // Wheel — use deltaY sign only, ignore magnitude (avoids trackpad overshooting)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isCooling.current) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    goTo(activeIndex + dir);
  }, [activeIndex, goTo]);

  // Touch
  const touchStartY = useRef(0);
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = useCallback((e) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 60) goTo(activeIndex + (delta > 0 ? 1 : -1));
  }, [activeIndex, goTo]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown') goTo(activeIndex + 1);
      if (e.key === 'ArrowUp') goTo(activeIndex - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, goTo]);

  // Wheel listener
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleAddToCart = (item, selectedOption = null) => {
    if (item.options?.length > 0 && selectedOption === null) { setDetailItem(item); return; }
    const opt = selectedOption !== null ? item.options[selectedOption] : null;
    setIsAddingId(item.id);
    addItem({ ...item, selectedOption: opt?.name || null, selectedOptionPrice: opt?.priceAdd || 0 });
    setTimeout(() => setIsAddingId(null), 800);
  };

  // Slide transition: smooth tween, NO spring (spring causes overshoot/jitter)
  const slideTransition = {
    duration: 0.72,
    ease: [0.22, 1, 0.36, 1], // custom cubic-bezier — fast start, gentle end
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden select-none"
      style={{ height: '100dvh' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides — stacked absolutely, moved by Y translate */}
      {showcaseItems.map((item, i) => {
        const offset = i - activeIndex;
        return (
          <motion.div
            key={item.id}
            className="absolute inset-0"
            style={{ pointerEvents: offset === 0 ? 'auto' : 'none' }}
            animate={{ y: `${offset * 100}%` }}
            transition={slideTransition}
          >
            <Slide
              item={item}
              isActive={offset === 0}
              isPrev={offset === -1}
              onAddToCart={handleAddToCart}
              onOpenDetail={setDetailItem}
              isAdding={isAddingId === item.id}
            />
          </motion.div>
        );
      })}

      {/* Side dot nav */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5">
        {showcaseItems.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Món ${i + 1}`}
            className={`rounded-full transition-all duration-400 bg-white ${i === activeIndex ? 'opacity-90 w-2 h-7' : 'opacity-25 hover:opacity-50 w-2 h-2'}`}
          />
        ))}
      </div>

      {/* Up arrow */}
      {activeIndex > 0 && (
        <button
          onClick={() => goTo(activeIndex - 1)}
          className="absolute top-5 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm text-white/60 flex items-center justify-center hover:bg-white/15 hover:text-white transition-all"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Down arrow */}
      {activeIndex < total - 1 && (
        <button
          onClick={() => goTo(activeIndex + 1)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm text-white/60 flex items-center justify-center hover:bg-white/15 hover:text-white transition-all"
        >
          <ChevronDown size={20} />
        </button>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/8 z-30">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((activeIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 right-6 z-30 font-mono text-xs text-white/30 tracking-widest">
        <span className="text-white/80 font-bold text-sm">{String(activeIndex + 1).padStart(2, '0')}</span>
        /{String(total).padStart(2, '0')}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {detailItem && (
          <DetailPanel
            key="detail"
            item={detailItem}
            onClose={() => setDetailItem(null)}
            onAdd={handleAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParallaxMenu;
