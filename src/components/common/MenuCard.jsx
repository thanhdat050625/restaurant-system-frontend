import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../features/menu/CartContext';
import { formatPrice } from '../../utils/helpers';

const MenuCard = ({ item, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (item.options && item.options.length > 0) {
      onQuickView?.(item);
      return;
    }
    setIsAdding(true);
    addItem({ ...item, selectedOption: null, selectedOptionPrice: 0 });
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onQuickView?.(item)}
      className="group bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 cursor-pointer border border-transparent hover:border-primary/20"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-48 sm:h-52">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isPopular && (
            <span className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full">
              🔥 Phổ biến
            </span>
          )}
          {item.isNew && (
            <span className="px-2.5 py-1 bg-success text-white text-xs font-semibold rounded-full">
              ✨ Mới
            </span>
          )}
          {item.originalPrice && (
            <span className="px-2.5 py-1 bg-error text-white text-xs font-semibold rounded-full">
              -{Math.round((1 - item.price / item.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Quick add button */}
        <motion.button
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-300"
        >
          {isAdding ? <ShoppingBag size={18} className="animate-pulse" /> : <Plus size={20} />}
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Time */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-text-light text-xs">
            <Clock size={12} />
            <span>{item.preparationTime} phút</span>
          </div>
          {item.dietary.length > 0 && (
            <div className="flex gap-1">
              {item.dietary.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-text-primary dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-text-secondary dark:text-text-light text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Rating & Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-accent fill-accent" />
            <span className="text-sm font-medium text-text-primary dark:text-white">{item.rating}</span>
            <span className="text-xs text-text-light">({item.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            {item.originalPrice && (
              <span className="text-sm text-text-light line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
