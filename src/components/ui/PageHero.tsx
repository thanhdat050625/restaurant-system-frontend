import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  image: string;
  /** Chừa khoảng trống phía dưới để card nội dung nổi đè lên hero (-mt-16) */
  overlap?: boolean;
}

/**
 * Hero dùng chung cho các trang khách hàng (cùng phong cách trang Giới thiệu)
 */
export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  image,
  overlap = false,
}) => (
  <section
    className={`relative pt-28 ${overlap ? 'pb-28 sm:pb-32' : 'pb-16 sm:pb-20'} bg-gradient-to-br from-dark via-dark-surface to-dark overflow-hidden`}
  >
    <img src={image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-25" />
    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-dark/20" />

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-medium text-accent"
        >
          {EyebrowIcon && <EyebrowIcon size={14} />}
          {eyebrow}
        </motion.span>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] leading-tight"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-white/70 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  </section>
);

export default PageHero;
