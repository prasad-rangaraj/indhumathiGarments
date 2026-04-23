import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  starClassName?: string;
  showText?: boolean;
  totalReviews?: number;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  className = "flex items-center gap-1", 
  starClassName = "h-4 w-4",
  showText = false,
  totalReviews
}: StarRatingProps) => {
  const roundedRating = Math.round(rating);

  return (
    <div className={className}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={`${starClassName} ${
              i < roundedRating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-sm font-bold text-foreground ml-1">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default StarRating;
