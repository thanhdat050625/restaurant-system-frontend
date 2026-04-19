import { motion } from 'framer-motion';

const CategoryCard = ({ category, isActive, onClick }) => {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(category)}
      className={`flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl min-w-[120px] transition-all duration-300 border-2 ${
        isActive
          ? 'bg-primary/10 border-primary shadow-glow'
          : 'bg-white dark:bg-dark-surface border-transparent hover:border-primary/20 shadow-card hover:shadow-card-hover'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
        isActive ? 'bg-primary text-white shadow-lg' : 'bg-light-card dark:bg-dark-card'
      }`}>
        {category.icon}
      </div>
      <span className={`text-sm font-medium text-center transition-colors duration-300 ${
        isActive ? 'text-primary' : 'text-text-primary dark:text-white'
      }`}>
        {category.name}
      </span>
      <span className="text-xs text-text-light">
        {category.itemCount} món
      </span>
    </motion.button>
  );
};

export default CategoryCard;
