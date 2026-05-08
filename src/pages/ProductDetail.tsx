import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, CreditCard, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useReviewsStore } from '@/stores/reviewsStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/ReviewForm';
import RelatedProducts from '@/components/RelatedProducts';
import StarRating from '@/components/StarRating';
import bgFashionModel from '@/assets/bg-fashion-model.png';

const colorPalettes: string[][] = [
  ['bg-rose-500', 'bg-pink-400', 'bg-fuchsia-500'],
  ['bg-pink-600', 'bg-rose-700', 'bg-pink-300'],
  ['bg-orange-300', 'bg-rose-100', 'bg-pink-200'],
];

const getColorsForProduct = (id: string) => {
  const numericId = parseInt(id, 10);
  const paletteIndex = Number.isNaN(numericId) ? 0 : numericId % colorPalettes.length;
  return colorPalettes[paletteIndex];
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { products, loading: productsLoading, fetchProducts, getProductById } = useProductsStore();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { fetchReviews, getReviewsByProductId, getAverageRating } = useReviewsStore();
  const { isAuthenticated } = useAuthStore();

  const product = id ? getProductById(id) : undefined;
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0 && !productsLoading) {
      fetchProducts();
    }
  }, [products.length, productsLoading, fetchProducts]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id, true); // Force fetch on mount
    }
  }, [product?.id, fetchReviews]);

  useEffect(() => {
    if (product) {
      document.title = product.metaTitle || `${product.name} | Indhumathi Garments`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', product.metaDescription || product.description || '');
      }
    }
    return () => {
      document.title = 'Indhumathi Garments';
    };
  }, [product]);

  const reviews = product ? getReviewsByProductId(product.id) : [];
  const averageRating = product ? getAverageRating(product.id) : 0;


  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to your cart",
      });
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      await addItem(product, selectedSize, quantity);
      toast({
        title: "Added to cart!",
        description: `${quantity} x ${product.name} (Size: ${selectedSize}${selectedColor ? `, Color: ${selectedColor}` : ''}) added to cart`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add to cart",
        description: error?.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to buy products",
      });
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before proceeding",
        variant: "destructive"
      });
      return;
    }

    await handleAddToCart();
    navigate('/cart');
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const colorOptions = getColorsForProduct(product.id);
  const wishlistStatus = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to use the wishlist",
      });
      navigate('/login');
      return;
    }

    if (wishlistStatus) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added`,
      });
    }
  };


  return (
    <div className="min-h-screen relative">
      {/* Background with blur - Fixed */}
      <div className="fixed inset-0 -z-10">
        <img
          src={bgFashionModel}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ objectPosition: 'center center' }}
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Back to Products
          </button>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Product Image Carousel */}
            <div className="animate-fade-in">
              {(() => {
                const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                const toUrl = (src: string) =>
                  src.startsWith('http') ? src : `${BASE}${src}`;
                // Build image list: prefer images[], fallback to [image]
                const imgList: string[] = (
                  product.images && product.images.length > 0
                    ? product.images
                    : product.image
                      ? [product.image]
                      : []
                );

                const hasPrev = currentImageIndex > 0;
                const hasNext = currentImageIndex < imgList.length - 1;

                return (
                  <div className="space-y-3">
                    {/* Main image */}
                    <div className="relative overflow-hidden rounded-xl bg-accent/40 aspect-square sm:aspect-[4/5] group">
                      {imgList.length > 0 ? (
                        <img
                          key={currentImageIndex}
                          src={toUrl(imgList[currentImageIndex])}
                          alt={`${product.name} ${currentImageIndex + 1}`}
                          className="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/15 to-background/40" />
                          <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                            <p className="text-lg sm:text-xl font-semibold text-foreground">Premium Cotton Lingerie</p>
                          </div>
                        </>
                      )}

                      {/* Left arrow */}
                      {hasPrev && (
                        <button
                          onClick={() => setCurrentImageIndex(i => i - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors shadow-md"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>
                      )}

                      {/* Right arrow */}
                      {hasNext && (
                        <button
                          onClick={() => setCurrentImageIndex(i => i + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors shadow-md"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 text-foreground" />
                        </button>
                      )}

                      {/* Image counter badge */}
                      {imgList.length > 1 && (
                        <div className="absolute bottom-3 right-3 z-20 bg-background/70 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
                          {currentImageIndex + 1} / {imgList.length}
                        </div>
                      )}
                    </div>

                    {/* Dot indicators */}
                    {imgList.length > 1 && (
                      <div className="flex justify-center gap-2">
                        {imgList.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${idx === currentImageIndex
                                ? 'bg-primary scale-125'
                                : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'
                              }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Thumbnail strip */}
                    {imgList.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {imgList.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${idx === currentImageIndex
                                ? 'border-primary ring-2 ring-primary/30'
                                : 'border-border/50 hover:border-primary/50'
                              }`}
                          >
                            <img
                              src={toUrl(img)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Product Details */}
            <div className="animate-slide-up">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{product.name}</h1>

              <StarRating
                rating={averageRating}
                totalReviews={reviews.length}
                showText={reviews.length > 0}
                className="flex items-center gap-2 mb-4"
              />
              {reviews.length === 0 && (
                <p className="text-xs text-muted-foreground -mt-3 mb-4 italic">Not yet rated</p>
              )}

              <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                {product.description}
              </p>

              <div className="mb-4 sm:mb-6 flex items-center gap-4">
                <span className="text-2xl sm:text-3xl font-bold text-primary">₹{product.price}</span>
                {!product.inStock && (
                  <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Material Info & Returns Highlight */}
              <div className="mb-6 p-4 bg-accent/50 rounded-lg space-y-2">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Material</h3>
                  <p className="text-muted-foreground text-sm">{product.material}</p>
                </div>
                <div className="border-t border-border/60 pt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    7-Day Easy Return*
                  </span>
                  <span className="text-muted-foreground">
                    Eligible for size issues or manufacturing defects. Full details shared on order confirmation.
                  </span>
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Select Color</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {colorOptions.map((colorClass) => (
                    <button
                      key={colorClass}
                      type="button"
                      onClick={() => setSelectedColor(colorClass)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${colorClass} ${selectedColor === colorClass ? 'border-primary ring-2 ring-primary/40' : 'border-background'
                        }`}
                      aria-label="Select color"
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Select Size</h3>
                <div className="flex gap-3">
                  {(product.sizes ?? ['S', 'M', 'L', 'XL']).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-border hover:border-primary transition-colors flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-border hover:border-primary transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`btn-secondary flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2.5 ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  <span className="sm:hidden">{product.inStock ? 'Add' : 'Sold Out'}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className={`btn-primary flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2.5 ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>{product.inStock ? 'Buy Now' : 'Out of Stock'}</span>
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2.5 min-w-[3rem] ${wishlistStatus ? 'bg-primary/20 text-primary' : ''
                    }`}
                  title={wishlistStatus ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${wishlistStatus ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            {/* Reviews */}
            <div className="md:col-span-2 mt-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Customer Reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    {reviews.length} review{reviews.length !== 1 && 's'} for this product
                  </p>
                </div>

                <StarRating rating={averageRating} showText />
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No reviews yet. Be the first to review this product!
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-border/60 bg-background/80 p-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-foreground text-base">
                          {review.name}
                        </p>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>

                      <StarRating rating={review.rating} />

                      <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.content}
                      </p>

                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-3">
                          {review.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`review-photo-${i + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              <ReviewForm productId={product.id} />
            </div>
          </div>

          <RelatedProducts currentProduct={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;