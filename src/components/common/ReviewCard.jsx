import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-light-border dark:border-dark-border">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
        />
        <div>
          <h4 className="font-semibold text-text-primary dark:text-white">{review.name}</h4>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < review.rating ? 'text-accent fill-accent' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-text-secondary dark:text-text-light text-sm leading-relaxed italic">
        "{review.comment}"
      </p>
      <p className="text-text-light text-xs mt-3">
        {new Date(review.date).toLocaleDateString('vi-VN')}
      </p>
    </div>
  );
};

export default ReviewCard;
