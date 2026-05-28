import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: number;
  name: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  productId: string;
  images?: string[];
}

interface ReviewsState {
  reviews: Record<string, Review[]>; // productId -> reviews
  loading: boolean;
  error: string | null;
  lastFetched: Record<string, number>;
  abortController: AbortController | null;
  fetchReviews: (productId: string, force?: boolean) => Promise<void>;
  getReviewsByProductId: (productId: string) => Review[];
  addReview: (productId: string, review: Omit<Review, 'id' | 'date' | 'productId'>) => Promise<void>;
  getAverageRating: (productId: string) => number;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: {},
      loading: false,
      error: null,
      lastFetched: {},
      abortController: null,

      fetchReviews: async (productId: string, force = false) => {
        const { lastFetched, loading, abortController } = get();
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000;

        if (!force && !loading && lastFetched[productId] && (now - lastFetched[productId] < CACHE_DURATION)) {
          return;
        }

        if (abortController) {
          abortController.abort();
        }

        const newAbortController = new AbortController();
        set({ loading: true, error: null, abortController: newAbortController });

        try {
          const reviewsData = await import('@/lib/api').then(m => m.reviewsAPI.getByProduct(productId));
          
          if (!newAbortController.signal.aborted) {
            const productReviews: Review[] = reviewsData.map((review: any) => ({
              id: review.id,
              name: review.name,
              rating: review.rating,
              title: review.title,
              content: review.content,
              date: new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
              productId: review.productId,
              images: review.images || [],
            }));
            
            set(state => ({
              reviews: { ...state.reviews, [productId]: productReviews },
              loading: false,
              lastFetched: { ...state.lastFetched, [productId]: now },
              abortController: null
            }));
          }
        } catch (error) {
           if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          set({ error: error instanceof Error ? error.message : 'Failed to fetch reviews', loading: false, abortController: null });
        }
      },

      getReviewsByProductId: (productId: string) => {
        return get().reviews[productId] || [];
      },

      addReview: async (productId: string, reviewData: Omit<Review, 'id' | 'date' | 'productId'>) => {
        set({ loading: true, error: null });
        try {
          const newReview = await import('@/lib/api').then(m => m.reviewsAPI.create({
            productId,
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
            images: reviewData.images || [],
          }));
          
          const review: Review = {
            id: newReview.id,
            name: newReview.name,
            rating: newReview.rating,
            title: newReview.title,
            content: newReview.content,
            date: new Date(newReview.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            productId: newReview.productId,
            images: newReview.images || [],
          };

          const currentReviews = get().reviews[productId] || [];
          const updatedReviews = [review, ...currentReviews];
          
          set(state => ({
            reviews: { ...state.reviews, [productId]: updatedReviews },
            loading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add review', loading: false });
          throw error; // re-throw so ReviewForm can catch it
        }
      },

      getAverageRating: (productId: string) => {
        const productReviews = get().reviews[productId] || [];
        if (productReviews.length === 0) return 0;
        const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / productReviews.length;
      },
    }),
    {
      name: 'reviews-storage',
    }
  )
);

