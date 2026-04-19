import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

const CartItem = ({ item, index, onUpdateQuantity, onRemove }) => {
  const itemTotal = (item.price + (item.selectedOptionPrice || 0)) * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="flex gap-4 p-4 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border hover:border-primary/30 transition-all duration-300"
    >
      {/* Image */}
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base font-semibold text-text-primary dark:text-white line-clamp-1">
          {item.name}
        </h4>
        {item.selectedOption && (
          <p className="text-xs text-text-secondary dark:text-text-light mt-0.5">
            {item.selectedOption}
          </p>
        )}
        <p className="text-primary font-bold mt-1">
          {formatPrice(item.price + (item.selectedOptionPrice || 0))}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-light-card dark:bg-dark-card hover:bg-primary/10 text-text-primary dark:text-white disabled:opacity-40 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-semibold text-text-primary dark:text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-text-primary dark:text-white">
              {formatPrice(itemTotal)}
            </span>
            <button
              onClick={() => onRemove(index)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/10 text-text-light hover:text-error transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
