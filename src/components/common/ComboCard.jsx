import { motion } from "framer-motion";
import { useCart } from "../../features/menu/CartContext";
import { formatPrice } from "../../utils/helpers";

const ComboCard = ({ item }) => {
  const { addItem } = useCart();

  const savings = item.originalPrice ? item.originalPrice - item.price : 0;
  const savingsPct = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem({ ...item, selectedOption: null, selectedOptionPrice: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 border border-transparent hover:border-secondary/20"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image — left side on sm+ */}
        <div className="relative sm:w-56 shrink-0 h-52 sm:h-auto overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {savingsPct > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-white text-xs font-bold rounded-full">
              -{savingsPct}%
            </div>
          )}
          {item.isNew && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-success text-white text-xs font-bold rounded-full">
              Mới
            </div>
          )}
        </div>

        {/* Content — right side */}
        <div className="flex flex-col justify-between p-5 flex-1">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <span className="shrink-0 mt-0.5 px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-semibold rounded-md tracking-wide uppercase">
                Combo
              </span>
              <h3 className="text-base font-bold text-text-primary dark:text-white group-hover:text-secondary transition-colors duration-300 leading-tight">
                {item.name}
              </h3>
            </div>

            <p className="text-text-secondary dark:text-text-light text-sm mb-3 leading-relaxed">
              {item.description}
            </p>

            {item.comboIncludes?.length > 0 && (
              <ul className="space-y-1 mb-4">
                {item.comboIncludes.map((inc, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-secondary dark:text-text-light">
                    <span className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                    {inc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-dark-border">
            <div>
              {item.originalPrice && (
                <p className="text-xs text-text-light line-through">
                  {formatPrice(item.originalPrice)}
                </p>
              )}
              <p className="text-xl font-bold text-secondary">
                {formatPrice(item.price)}
              </p>
              {savings > 0 && (
                <p className="text-xs text-success font-medium">
                  Tiết kiệm {formatPrice(savings)}
                </p>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="px-5 py-2.5 bg-secondary hover:bg-secondary-dark text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
