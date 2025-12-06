import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  productId: string;
  onSubmit?: (review: any) => void;
}

const ReviewForm = ({ productId, onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !title || !content) {
      toast({
        title: "Please fill all fields",
        description: "Name, title, and review content are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const review = {
      id: Date.now(),
      name,
      rating,
      title,
      content,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    };

    // Save to localStorage
    const savedReviews = localStorage.getItem(`reviews_${productId}`);
    const reviews = savedReviews ? JSON.parse(savedReviews) : [];
    reviews.unshift(review);
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));

    if (onSubmit) {
      onSubmit(review);
    }
    
    // Reset form
    setName('');
    setTitle('');
    setContent('');
    setRating(5);
    
    toast({
      title: "Review submitted!",
      description: "Thank you for your feedback",
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="border border-dashed border-primary/50 rounded-lg p-6 bg-accent/30">
      <h3 className="text-lg font-semibold text-foreground mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="review-name">Your Name</Label>
          <Input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Rating</Label>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="review-title">Review Title</Label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="review-content">Your Review</Label>
          <Textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
};

export default ReviewForm;
