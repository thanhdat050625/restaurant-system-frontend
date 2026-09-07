import React, { useState, forwardRef, useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Star, Clock, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { menuItems } from '../../../assets/data/menuData';
import { categories } from '../../../assets/data/categoryData';
import { useCart } from '../../../features/menu/CartContext';
import { formatPrice } from '../../../utils/helpers';
import Modal from '../../../components/ui/Modal';

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
const PageCover = forwardRef(({ title, subtitle, isBack }, ref) => (
  <div
    ref={ref}
    data-density="hard"
    className="w-full h-full relative overflow-hidden flex items-center justify-center"
    style={{
      background: isBack
        ? 'linear-gradient(160deg, #2c1a0e 0%, #1a0f07 100%)'
        : 'linear-gradient(160deg, #3d2410 0%, #2c1a0e 50%, #1a0f07 100%)',
    }}
  >
    {/* Subtle texture overlay */}
    <div className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)' , backgroundSize: '8px 8px' }} />

    {/* Outer border */}
    <div className="absolute inset-5 border border-[#c49a5a]/25 rounded-sm pointer-events-none" />
    {/* Inner border */}
    <div className="absolute inset-8 border border-[#c49a5a]/15 rounded-sm pointer-events-none" />

    {/* Top ornament */}
    <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
      <div className="h-px w-16 bg-[#c49a5a]/30" />
      <span className="text-[#c49a5a]/50 text-xs tracking-widest">✦</span>
      <div className="h-px w-16 bg-[#c49a5a]/30" />
    </div>

    <div className="text-center px-12 z-10">
      {subtitle && (
        <p className="text-[#c49a5a]/60 text-[10px] uppercase tracking-[0.5em] mb-8 font-light">
          {subtitle}
        </p>
      )}
      <h2
        className="text-white font-light tracking-wide mb-5 leading-snug"
        style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontFamily: '"Palatino Linotype", Georgia, serif' }}
      >
        {title}
      </h2>
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px w-12 bg-[#c49a5a]/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#c49a5a]/50" />
        <div className="h-px w-12 bg-[#c49a5a]/40" />
      </div>
      {!isBack && <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase">Lật để xem thực đơn</p>}
      {isBack && <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase">Cảm ơn quý khách</p>}
    </div>

    {/* Bottom ornament */}
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
      <div className="h-px w-16 bg-[#c49a5a]/30" />
      <span className="text-[#c49a5a]/50 text-xs tracking-widest">✦</span>
      <div className="h-px w-16 bg-[#c49a5a]/30" />
    </div>

    {/* Page edge shadow */}
    <div
      className="absolute inset-y-0 right-0 w-6 pointer-events-none"
      style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.35), transparent)' }}
    />
  </div>
));
PageCover.displayName = 'PageCover';

// ─── INNER PAGE ───────────────────────────────────────────────────────────────
const Page = forwardRef(({ children, categoryName, pageNum, side }, ref) => {
  const isLeft = side === 'left';
  return (
    <div
      ref={ref}
      className="w-full h-full flex flex-col"
      style={{
        background: isLeft
          ? 'linear-gradient(to right, #faf6ef, #f7f2e8)'
          : 'linear-gradient(to left, #faf6ef, #f5f0e4)',
        borderLeft: isLeft ? 'none' : '1px solid rgba(180,140,80,0.15)',
        borderRight: isLeft ? '1px solid rgba(180,140,80,0.12)' : 'none',
      }}
    >
      {/* Header */}
      <div className="px-8 pt-7 pb-3 flex items-baseline justify-between border-b border-[#c9a96e]/20">
        <span
          className="text-[#6b4423] font-semibold text-sm tracking-wide"
          style={{ fontFamily: '"Palatino Linotype", Georgia, serif' }}
        >
          {categoryName}
        </span>
        <span className="text-[#b89a60]/50 text-[10px] tracking-widest font-mono">{pageNum}</span>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-7 py-4 scrollbar-hide space-y-1">
        {children}
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t border-[#c9a96e]/15 text-center">
        <span className="text-[#c49a5a]/35 text-[9px] tracking-[0.4em] uppercase font-light">FoodHub</span>
      </div>
    </div>
  );
});
Page.displayName = 'Page';

// ─── MENU ITEM ROW ────────────────────────────────────────────────────────────
const MenuItemRow = ({ item, onClick, onAdd, isAdding }) => (
  <div
    onClick={onClick}
    className="group flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg cursor-pointer hover:bg-[#f0e6cf]/60 transition-colors duration-200"
  >
    {/* Thumbnail */}
    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5">
      <img
        src={item.image} alt={item.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-1 mb-0.5">
        <h3
          className="text-[13px] font-semibold text-[#3b2209] leading-snug line-clamp-1 group-hover:text-[#7a4b10] transition-colors"
          style={{ fontFamily: '"Palatino Linotype", Georgia, serif' }}
        >
          {item.name}
        </h3>
        {item.isPopular && (
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#c49a5a]/15 text-[#8b6520] rounded shrink-0">
            Best
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#7a6040]/70 line-clamp-1 mb-1.5 leading-snug">{item.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-[#a08050]/70">
          <span className="flex items-center gap-0.5">
            <Star size={9} className="text-amber-500 fill-amber-500" />{item.rating}
          </span>
          <span className="flex items-center gap-0.5"><Clock size={9} />{item.preparationTime}p</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#7a4b10]">{formatPrice(item.price)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(e, item); }}
            className="w-6 h-6 rounded-full bg-[#c49a5a]/10 text-[#7a4b10] hover:bg-[#c49a5a] hover:text-white flex items-center justify-center transition-all duration-200"
          >
            {isAdding ? <ShoppingBag size={10} className="animate-pulse" /> : <Plus size={12} />}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const FlipbookMenu = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAddingId, setIsAddingId] = useState(null);
  const { addItem } = useCart();
  const flipRef = React.useRef(null);

  const pagesData = useMemo(() => {
    const pages = [];
    categories.forEach(cat => {
      const items = menuItems.filter(i => i.categoryId === cat.id);
      if (!items.length) return;
      for (let i = 0; i < items.length; i += 5) {
        pages.push({ categoryName: cat.name, items: items.slice(i, i + 5) });
      }
    });
    return pages;
  }, []);

  const handleAdd = (e, item) => {
    e.stopPropagation();
    if (item.options?.length > 0) { setSelectedItem(item); return; }
    setIsAddingId(item.id);
    addItem({ ...item, selectedOption: null, selectedOptionPrice: 0 });
    setTimeout(() => setIsAddingId(null), 800);
  };

  const handleAddFromModal = () => {
    if (!selectedItem) return;
    const opt = selectedOption !== null ? selectedItem.options[selectedOption] : null;
    addItem({ ...selectedItem, selectedOption: opt?.name || null, selectedOptionPrice: opt?.priceAdd || 0 });
    setSelectedItem(null); setSelectedOption(null);
  };

  const flip = (dir) => {
    const pf = flipRef.current?.pageFlip();
    if (!pf) return;
    dir > 0 ? pf.flipNext() : pf.flipPrev();
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center py-10 px-4"
      style={{ background: 'linear-gradient(160deg, #1c0f06 0%, #2e1a0b 40%, #1c0f06 100%)' }}
    >
      {/* Sub-label */}
      <p className="text-[#c49a5a]/40 text-[10px] uppercase tracking-[0.5em] mb-6 font-light">
        Thực đơn — Premium Collection
      </p>

      {/* Flipbook wrapper – stretch to nearly full viewport width */}
      <div className="w-full max-w-[1200px] mx-auto" style={{ height: 'min(78vh, 720px)' }}>
        <HTMLFlipBook
          ref={flipRef}
          width={520}
          height={700}
          size="stretch"
          minWidth={260}
          maxWidth={640}
          minHeight={400}
          maxHeight={840}
          maxShadowOpacity={0.55}
          showCover={true}
          mobileScrollSupport={true}
          drawShadow={true}
          flippingTime={650}
          usePortrait={false}
          style={{ margin: '0 auto' }}
        >
          <PageCover title="Thực Đơn" subtitle="FoodHub Restaurant" />

          {pagesData.map((page, i) => (
            <Page
              key={i}
              pageNum={String(i + 1).padStart(2, '0')}
              categoryName={page.categoryName}
              side={i % 2 === 0 ? 'right' : 'left'}
            >
              {page.items.map(item => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                  onAdd={handleAdd}
                  isAdding={isAddingId === item.id}
                />
              ))}
            </Page>
          ))}

          <PageCover title="FoodHub" isBack />
        </HTMLFlipBook>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6 mt-7">
        <button
          onClick={() => flip(-1)}
          className="w-11 h-11 rounded-full border border-[#c49a5a]/25 text-[#c49a5a]/60 hover:border-[#c49a5a]/60 hover:text-[#c49a5a] hover:bg-[#c49a5a]/10 flex items-center justify-center transition-all duration-300"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[#c49a5a]/30 text-[10px] tracking-widest uppercase font-light">Lật trang</span>
        <button
          onClick={() => flip(1)}
          className="w-11 h-11 rounded-full border border-[#c49a5a]/25 text-[#c49a5a]/60 hover:border-[#c49a5a]/60 hover:text-[#c49a5a] hover:bg-[#c49a5a]/10 flex items-center justify-center transition-all duration-300"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => { setSelectedItem(null); setSelectedOption(null); }}
        title={selectedItem?.name}
        size="md"
      >
        {selectedItem && (
          <div>
            <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-56 object-cover rounded-xl mb-4" />
            <p className="text-text-secondary dark:text-text-light text-sm mb-4">{selectedItem.description}</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1"><Star size={16} className="text-accent fill-accent" /><span className="font-medium">{selectedItem.rating}</span><span className="text-text-light text-sm">({selectedItem.reviewCount})</span></div>
              <div className="flex items-center gap-1 text-text-light text-sm"><Clock size={14} /> {selectedItem.preparationTime} phút</div>
            </div>
            {selectedItem.options.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-text-primary dark:text-white mb-2">Tuỳ chọn:</p>
                <div className="space-y-2">
                  {selectedItem.options.map((opt, i) => (
                    <button key={i} onClick={() => setSelectedOption(i)} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedOption === i ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-primary/50'}`}>
                      <span className="text-sm text-text-primary dark:text-white">{opt.name}</span>
                      <span className="text-sm font-medium text-primary">{opt.priceAdd > 0 ? `+${formatPrice(opt.priceAdd)}` : 'Mặc định'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
              <span className="text-2xl font-bold text-primary">{formatPrice(selectedItem.price + (selectedOption !== null ? selectedItem.options[selectedOption]?.priceAdd || 0 : 0))}</span>
              <button onClick={handleAddFromModal} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:scale-105">Thêm vào giỏ</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FlipbookMenu;
