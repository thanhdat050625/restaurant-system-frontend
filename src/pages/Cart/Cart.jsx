import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import CartItem from '../../components/common/CartItem';
import { useCart } from '../../features/menu/CartContext';
import { formatPrice } from '../../utils/helpers';

const Cart = () => {
  const { items, totalItems, subtotal, deliveryFee, total, deliveryType, setDeliveryType, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <PageWrapper>
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-4">Giỏ hàng trống</h2>
            <p className="text-text-secondary dark:text-text-light mb-8">Hãy thêm món ăn yêu thích vào giỏ hàng</p>
            <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:scale-105 hover:shadow-glow">
              <ShoppingBag size={20} /> Xem thực đơn <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="pt-28 pb-20 bg-light dark:bg-dark min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)]">Giỏ Hàng</h1>
              <p className="text-text-secondary dark:text-text-light mt-1">{totalItems} món trong giỏ</p>
            </div>
            <button onClick={clearCart} className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-xl transition-colors text-sm font-medium">
              <Trash2 size={16} /> Xoá tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <CartItem key={`${item.id}-${item.selectedOption}-${index}`} item={item} index={index} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
                ))}
              </AnimatePresence>

              <Link to="/menu" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium mt-4 transition-colors">
                <ArrowLeft size={18} /> Tiếp tục chọn món
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">Tóm tắt đơn hàng</h3>

                {/* Delivery Type */}
                <div className="flex bg-light-card dark:bg-dark-card rounded-xl p-1 mb-6">
                  <button onClick={() => setDeliveryType('delivery')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${deliveryType === 'delivery' ? 'bg-primary text-white shadow-md' : 'text-text-secondary dark:text-text-light'}`}>
                    🚚 Giao hàng
                  </button>
                  <button onClick={() => setDeliveryType('pickup')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${deliveryType === 'pickup' ? 'bg-primary text-white shadow-md' : 'text-text-secondary dark:text-text-light'}`}>
                    🏪 Tự đến lấy
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary dark:text-text-light">Tạm tính</span>
                    <span className="text-text-primary dark:text-white font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary dark:text-text-light">Phí vận chuyển</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-success' : 'text-text-primary dark:text-white'}`}>
                      {deliveryFee === 0 ? 'Miễn phí' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {deliveryType === 'delivery' && subtotal < 200000 && (
                    <p className="text-xs text-accent">💡 Mua thêm {formatPrice(200000 - subtotal)} để miễn phí ship</p>
                  )}
                  <hr className="border-light-border dark:border-dark-border" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-text-primary dark:text-white">Tổng cộng</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block w-full py-4 bg-primary hover:bg-primary-dark text-white text-center font-semibold rounded-full transition-all hover:scale-[1.02] hover:shadow-glow">
                  Thanh toán ({formatPrice(total)})
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Cart;
