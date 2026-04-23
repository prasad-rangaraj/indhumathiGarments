import { useState, useRef } from 'react';
import { Star, Send, CheckCircle, LogIn, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useReviewsStore } from '@/stores/reviewsStore';
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';

interface ReviewFormProps {
  productId: string;
}

const MAX_PHOTOS = 4;

const ReviewForm = ({ productId }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { addReview } = useReviewsStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - images.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    // Clear input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      toast({
        title: "Please fill all fields",
        description: "Review title and content are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview(productId, {
        name: user?.name || 'Anonymous',
        rating,
        title,
        content,
        images,
      });
      setSubmitted(true);
      toast({
        title: "Review submitted!",
        description: "Your review is pending approval and will appear once reviewed by our team.",
      });
    } catch {
      toast({
        title: "Failed to submit",
        description: "Could not submit your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="border border-dashed border-primary/40 rounded-lg p-6 bg-accent/20 flex flex-col items-center gap-3 text-center mt-6">
        <LogIn className="w-6 h-6 text-primary" />
        <p className="font-medium text-foreground">Want to leave a review?</p>
        <p className="text-sm text-muted-foreground">You need to be logged in to submit a review.</p>
        <Link to="/login" className="btn-primary text-sm px-4 py-2">
          Login to Review
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="border border-dashed border-green-400/60 rounded-lg p-6 bg-green-50/30 flex flex-col items-center gap-3 text-center mt-6">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <p className="font-semibold text-foreground">Review Submitted!</p>
        <p className="text-sm text-muted-foreground">
          Thank you for your feedback. Your review is pending approval and will appear once reviewed by our team.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-dashed border-primary/50 rounded-lg p-6 bg-accent/30 mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">Write a Review</h3>
      <p className="text-xs text-muted-foreground mb-4">Posted as <span className="font-medium text-foreground">{user.name}</span> · Pending admin approval</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
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
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="review-title">Review Title <span className="text-red-500">*</span></Label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="mt-1"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="review-content">Your Review <span className="text-red-500">*</span></Label>
          <Textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
            className="mt-1"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <Label>Photos <span className="text-muted-foreground text-xs">(optional, up to {MAX_PHOTOS})</span></Label>
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                <img src={img} alt={`review-${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-primary/40 bg-accent/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
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
