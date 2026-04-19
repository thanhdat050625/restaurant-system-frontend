import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Star, Clock } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import MenuCard from '../../components/common/MenuCard';
import CategoryCard from '../../components/common/CategoryCard';
import Modal from '../../components/ui/Modal';
import { menuItems } from '../../data/menuData';
import { categories } from '../../data/categoryData';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const { addItem } = useCart();

  const filteredItems = useMemo(() => {
    let items = [...menuItems];

    // Category filter
    if (activeCategory !== 'all') {
      const cat = categories.find(c => c.slug === activeCategory);
      if (cat) items = items.filter(item => item.categoryId === cat.id);
    }

    // Search filter
    if (search) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular': items.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'price-asc': items.sort((a, b) => a.price - b.price); break;
      case 'price-desc': items.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return items;
  }, [activeCategory, search, sortBy]);

  const handleCategoryClick = (cat) => {
    const slug = cat?.slug || 'all';
    setActiveCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleAddFromModal = () => {
    if (selectedItem) {
      const opt = selectedOption !== null ? selectedItem.options[selectedOption] : null;
      addItem({ ...selectedItem, selectedOption: opt?.name || null, selectedOptionPrice: opt?.priceAdd || 0 });
      setSelectedItem(null);
      setSelectedOption(null);
    }
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-dark via-dark-surface to-dark overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4"
          >
            Thực Đơn <span className="gradient-text">FoodHub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 max-w-lg mx-auto mb-8"
          >
            Khám phá hơn 500 món ăn đa dạng từ Á đến Âu
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md text-white placeholder-white/50 rounded-full border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Categories + Menu */}
      <section className="py-12 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto py-4 px-2 -mx-2 mb-8 scrollbar-hide">
            <CategoryCard
              category={{ icon: '🍽️', name: 'Tất cả', itemCount: menuItems.length }}
              isActive={activeCategory === 'all'}
              onClick={() => handleCategoryClick({ slug: 'all' })}
            />
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isActive={activeCategory === cat.slug}
                onClick={() => handleCategoryClick(cat)}
              />
            ))}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-text-secondary dark:text-text-light">
              <span className="font-semibold text-text-primary dark:text-white">{filteredItems.length}</span> món ăn
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
              </select>
            </div>
          </div>

          {/* Menu Grid */}
          <AnimatePresence mode="wait">
            {filteredItems.length > 0 ? (
              <motion.div
                key={activeCategory + sortBy}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredItems.map(item => (
                  <MenuCard key={item.id} item={item} onQuickView={setSelectedItem} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2">Không tìm thấy món ăn</h3>
                <p className="text-text-secondary dark:text-text-light">Thử tìm kiếm với từ khóa khác</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Quick View Modal */}
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
              <button onClick={handleAddFromModal} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:scale-105 hover:shadow-glow">Thêm vào giỏ</button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default Menu;
