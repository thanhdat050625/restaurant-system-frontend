import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Plus, ShoppingBag, Search } from 'lucide-react';
import { menuItems } from '../../../assets/data/menuData';
import { categories } from '../../../assets/data/categoryData';
import { useCart } from '../../../features/menu/CartContext';
import { formatPrice } from '../../../utils/helpers';
import Modal from '../../../components/ui/Modal';

// Bento cell size pattern — cycles every 8 items
const PATTERN = [
  'md:col-span-2 md:row-span-2', // Large square
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1', // Wide
  'md:col-span-1 md:row-span-2', // Tall
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
];

const BentoCard = ({ item, index, onClick, onAdd, isAdding }) => {
  const cellClass = PATTERN[index % PATTERN.length];
  const isLarge = cellClass.includes('col-span-2') && cellClass.includes('row-span-2');
  const isTall = !isLarge && cellClass.includes('row-span-2');
  const isWide = cellClass.includes('col-span-2') && !cellClass.includes('row-span-2');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20, delay: index * 0.04 }}
      whileHover={{ scale: 0.985, zIndex: 10 }}
      onClick={() => onClick(item)}
      className={`group relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer bg-white dark:bg-dark-surface shadow-md hover:shadow-2xl transition-shadow ${cellClass}`}
      style={{ minHeight: '200px' }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={item.image} alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Gradient */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLarge ? 'bg-gradient-to-t from-black/85 via-black/25 to-black/5' : 'bg-gradient-to-t from-black/80 to-black/10'}`} />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end text-white">
        {/* Badges */}
        <div className="flex gap-1.5 mb-2">
          {item.isPopular && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary rounded-full shadow-md">HOT</span>}
          {item.isNew && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500 rounded-full shadow-md">NEW</span>}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-black text-white leading-tight line-clamp-2 group-hover:text-primary-light transition-colors ${isLarge ? 'text-2xl md:text-3xl mb-2' : isWide ? 'text-xl md:text-2xl mb-1' : 'text-lg mb-1'}`}
              style={{ fontFamily: 'Georgia, serif' }}>
              {item.name}
            </h3>

            {(isLarge || isTall) && (
              <p className="text-white/70 text-sm line-clamp-2 mb-2">{item.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-black text-primary-light ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-white/40 text-sm line-through">{formatPrice(item.originalPrice)}</span>
              )}
              <span className="flex items-center gap-0.5 text-xs text-white/60">
                <Star size={11} className="text-amber-400 fill-amber-400" />{item.rating}
              </span>
              {isLarge && (
                <span className="flex items-center gap-0.5 text-xs text-white/60">
                  <Clock size={11} />{item.preparationTime}p
                </span>
              )}
            </div>
          </div>

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onAdd(e, item); }}
            className={`shrink-0 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all shadow-lg ${isLarge ? 'w-14 h-14' : 'w-10 h-10'}`}
          >
            {isAdding ? <ShoppingBag size={isLarge ? 22 : 16} className="animate-pulse" /> : <Plus size={isLarge ? 24 : 18} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const BentoMenu = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();
  const [isAddingId, setIsAddingId] = useState(null);

  const allCategories = [{ id: 'all', name: '✦ Tất cả' }, ...categories];

  const filteredItems = useMemo(() => {
    let items = [...menuItems];
    if (activeCategory !== 'all') items = items.filter(item => item.categoryId === Number(activeCategory));
    if (search) items = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
    return items;
  }, [activeCategory, search]);

  const handleAddToCart = (e, item) => {
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

  return (
    <div className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#f8f4ef] dark:bg-dark">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Thực đơn</p>
            <h2 className="text-4xl md:text-6xl font-black text-text-primary dark:text-white leading-none"
              style={{ fontFamily: 'Georgia, serif' }}>
              Bento<br /><span className="text-primary">Collection</span>
            </h2>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm món..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm text-text-primary dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {allCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(String(cat.id))}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === String(cat.id)
                  ? 'bg-text-primary dark:bg-white text-white dark:text-black shadow-lg scale-105'
                  : 'bg-white dark:bg-dark-surface text-text-secondary dark:text-text-light hover:bg-black/5 dark:hover:bg-white/5 shadow-sm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div
              key={activeCategory + search}
              className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-3 md:gap-4"
            >
              {filteredItems.map((item, i) => (
                <BentoCard
                  key={item.id}
                  item={item}
                  index={i}
                  onClick={setSelectedItem}
                  onAdd={handleAddToCart}
                  isAdding={isAddingId === item.id}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-semibold text-text-primary dark:text-white">Không tìm thấy món ăn</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={!!selectedItem} onClose={() => { setSelectedItem(null); setSelectedOption(null); }} title={selectedItem?.name} size="md">
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

export default BentoMenu;
