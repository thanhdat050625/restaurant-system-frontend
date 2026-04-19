import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Clock, Star, UtensilsCrossed, CalendarCheck, ShoppingBag } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import MenuCard from '../../components/common/MenuCard';
import CategoryCard from '../../components/common/CategoryCard';
import ReviewCard from '../../components/common/ReviewCard';
import Modal from '../../components/ui/Modal';
import { menuItems } from '../../data/menuData';
import { categories } from '../../data/categoryData';
import { reviews } from '../../data/restaurantData';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const Home = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const { addItem } = useCart();

  const popularItems = menuItems.filter(item => item.isPopular).slice(0, 8);

  const handleAddFromModal = () => {
    if (selectedItem) {
      const option = selectedOption !== null ? selectedItem.options[selectedOption] : null;
      addItem({
        ...selectedItem,
        selectedOption: option?.name || null,
        selectedOptionPrice: option?.priceAdd || 0,
      });
      setSelectedItem(null);
      setSelectedOption(null);
    }
  };

  return (
    <PageWrapper>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"
            alt="Restaurant ambience"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm text-primary-light text-sm font-medium rounded-full border border-primary/30 mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Nhà hàng đang mở cửa
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 font-[family-name:var(--font-heading)]"
            >
              Hương Vị{' '}
              <span className="gradient-text">Đỉnh Cao</span>
              <br />
              Tại FoodHub
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed"
            >
              Đặt món online giao tận nơi hoặc đặt bàn trước tại nhà hàng. Trải nghiệm ẩm thực hoàn hảo chỉ với vài cú click.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white text-base font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-glow group"
              >
                <ShoppingBag size={20} />
                Đặt Món Ngay
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/reservation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-base font-semibold rounded-full border border-white/30 transition-all duration-300 hover:scale-105"
              >
                <CalendarCheck size={20} />
                Đặt Bàn
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex gap-8 mt-12"
            >
              {[
                { value: '500+', label: 'Món ăn' },
                { value: '10k+', label: 'Khách hàng' },
                { value: '4.9', label: 'Đánh giá' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-4">
              Cách <span className="text-primary">Hoạt Động</span>
            </h2>
            <p className="text-text-secondary dark:text-text-light max-w-xl mx-auto">
              Đặt món hoặc đặt bàn chỉ với 3 bước đơn giản
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: UtensilsCrossed, title: 'Chọn Món', desc: 'Duyệt thực đơn đa dạng và chọn món yêu thích của bạn', color: 'from-primary to-primary-dark' },
              { icon: ShoppingBag, title: 'Đặt Hàng', desc: 'Xác nhận đơn hàng, chọn giao tận nơi hoặc đặt bàn', color: 'from-secondary to-secondary-dark' },
              { icon: Truck, title: 'Thưởng Thức', desc: 'Nhận món tại nhà hoặc đến nhà hàng thưởng thức', color: 'from-accent to-accent-dark' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center p-8 bg-white dark:bg-dark-surface rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-2"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <step.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2 font-[family-name:var(--font-heading)]">
                  {step.title}
                </h3>
                <p className="text-text-secondary dark:text-text-light text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">
                Khám Phá <span className="text-primary">Danh Mục</span>
              </h2>
              <p className="text-text-secondary dark:text-text-light">Đa dạng hương vị từ Á đến Âu</p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors group"
            >
              Xem tất cả
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/menu?category=${cat.slug}`}>
                  <CategoryCard category={cat} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR DISHES ===== */}
      <section className="py-20 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">
                Món Ăn <span className="text-primary">Phổ Biến</span>
              </h2>
              <p className="text-text-secondary dark:text-text-light">Được yêu thích nhất bởi khách hàng</p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors group"
            >
              Xem thực đơn
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                onQuickView={setSelectedItem}
              />
            ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:scale-105"
            >
              Xem thực đơn đầy đủ <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== RESERVATION CTA ===== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920"
            alt="Fine dining"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
              Đặt Bàn <span className="gradient-text">Ngay Hôm Nay</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8 text-lg">
              Đặt bàn trước và order món sẵn, tới nơi chỉ cần ngồi thưởng thức. Hoặc tới nhà hàng rồi mới order - tuỳ bạn!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/reservation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:scale-105 hover:shadow-glow"
              >
                <CalendarCheck size={20} />
                Đặt Bàn & Order Trước
              </Link>
              <Link
                to="/reservation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/30 transition-all hover:scale-105"
              >
                Chỉ Đặt Bàn
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="py-20 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-4">
              Khách Hàng <span className="text-primary">Nói Gì?</span>
            </h2>
            <p className="text-text-secondary dark:text-text-light max-w-xl mx-auto">
              Hơn 10,000 khách hàng hài lòng với dịch vụ của chúng tôi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QUICK VIEW MODAL ===== */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => { setSelectedItem(null); setSelectedOption(null); }}
        title={selectedItem?.name}
        size="md"
      >
        {selectedItem && (
          <div>
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-full h-56 object-cover rounded-xl mb-4"
            />
            <p className="text-text-secondary dark:text-text-light text-sm mb-4">
              {selectedItem.description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-accent fill-accent" />
                <span className="font-medium">{selectedItem.rating}</span>
                <span className="text-text-light text-sm">({selectedItem.reviewCount} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1 text-text-light text-sm">
                <Clock size={14} />
                {selectedItem.preparationTime} phút
              </div>
            </div>

            {selectedItem.options.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-text-primary dark:text-white mb-2">Tuỳ chọn:</p>
                <div className="space-y-2">
                  {selectedItem.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                        selectedOption === i
                          ? 'border-primary bg-primary/5'
                          : 'border-light-border dark:border-dark-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm text-text-primary dark:text-white">{opt.name}</span>
                      <span className="text-sm font-medium text-primary">
                        {opt.priceAdd > 0 ? `+${formatPrice(opt.priceAdd)}` : 'Mặc định'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
              <div>
                {selectedItem.originalPrice && (
                  <span className="text-text-light line-through text-sm mr-2">
                    {formatPrice(selectedItem.originalPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(selectedItem.price + (selectedOption !== null ? selectedItem.options[selectedOption]?.priceAdd || 0 : 0))}
                </span>
              </div>
              <button
                onClick={handleAddFromModal}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:scale-105 hover:shadow-glow"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default Home;
