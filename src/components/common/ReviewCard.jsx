import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => {
  return (
    <div className="relative bg-white dark:bg-dark-surface p-7 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Large decorative quote */}
      <div className="absolute top-4 right-5 text-[80px] font-serif leading-none text-primary/8 dark:text-primary/10 select-none pointer-events-none group-hover:text-primary/12 transition-colors duration-500">
        "
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < review.rating ? 'text-accent fill-accent' : 'text-gray-200 dark:text-gray-600'}
          />
        ))}
      </div>

      {/* Comment */}
      <p className="text-text-secondary dark:text-text-light text-sm leading-relaxed flex-1 mb-5">
        {review.comment}
      </p>

      {/* Attribution — avatar + name + date */}
      <div className="flex items-center gap-3 pt-4 border-t border-light-border/60 dark:border-dark-border/60">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/15"
        />
        <div>
          <h4 className="text-sm font-semibold text-text-primary dark:text-white">{review.name}</h4>
          <p className="text-xs text-text-light">
            {new Date(review.date).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;

