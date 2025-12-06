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
}

interface ReviewsState {
  reviews: Record<string, Review[]>; // productId -> reviews
  loading: boolean;
  error: string | null;
  fetchReviews: (productId: string) => Promise<void>;
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

      fetchReviews: async (productId: string) => {
        set({ loading: true, error: null });
        try {
          const reviewsData = await import('@/lib/api').then(m => m.reviewsAPI.getByProduct(productId));
          
          const productReviews: Review[] = reviewsData.map((review: any) => ({
            id: review.id,
            name: review.name,
            rating: review.rating,
            title: review.title,
            content: review.content,
            date: new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            productId: review.productId,
          }));
          
          set(state => ({
            reviews: { ...state.reviews, [productId]: productReviews },
            loading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch reviews', loading: false });
        }
      },

      getReviewsByProductId: (productId: string) => {
        return get().reviews[productId] || [];
      },

      addReview: async (productId: string, reviewData: Omit<Review, 'id' | 'date' | 'productId'>) => {
        set({ loading: true, error: null });
        try {
          const { user } = await import('@/stores/authStore').then(m => m.useAuthStore.getState());
          
          const newReview = await import('@/lib/api').then(m => m.reviewsAPI.create({
            productId,
            userId: user?.id || null,
            name: reviewData.name,
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
          }));
          
          const review: Review = {
            id: newReview.id,
            name: newReview.name,
            rating: newReview.rating,
            title: newReview.title,
            content: newReview.content,
            date: new Date(newReview.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            productId: newReview.productId,
          };

          const currentReviews = get().reviews[productId] || [];
          const updatedReviews = [review, ...currentReviews];
          
          set(state => ({
            reviews: { ...state.reviews, [productId]: updatedReviews },
            loading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add review', loading: false });
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

