import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`min-h-screen ${className}`}
    >
      {children}
    </motion.main>
  );
};

export default PageWrapper;
