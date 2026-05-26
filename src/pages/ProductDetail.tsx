import { useState, useEffect, useRef } from 'react';
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
  const imageScrollRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
    if (imageScrollRef.current) {
      imageScrollRef.current.scrollTo({
        left: index * imageScrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

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

  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product?.colors, selectedColor]);


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
    if (!product) return false;

    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to your cart",
      });
      navigate('/login');
      return false;
    }

    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart",
        variant: "destructive"
      });
      return false;
    }

    if (product.stock !== undefined && product.stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} items left in stock`,
        variant: "destructive"
      });
      return false;
    }

    try {
      await addItem(product, selectedSize, quantity);
      toast({
        title: "Added to cart!",
        description: `${quantity} x ${product.name} (Size: ${selectedSize}) added`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to add to cart",
        description: error?.message || "Please try again",
        variant: "destructive"
      });
      return false;
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

    const success = await handleAddToCart();
    if (success) {
        navigate('/cart');
    }
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
        description: `${product.name} removed`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} added`,
      });
    }
  };


  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background with blur - Fixed */}
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img
          src={bgFashionModel}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ objectPosition: 'center 25%' }}
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>

      <div className="py-6 sm:py-8 px-2 sm:px-6 relative z-10">
        <div className="mx-4 sm:mx-auto max-w-6xl">

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Product Image Carousel */}
            <div className="animate-fade-in min-w-1">
              {(() => {
                const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                const toUrl = (src: string) => {
                  if (!src) return '';
                  if (src.startsWith('http')) return src;
                  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
                  const path = src.startsWith('/') ? src : `/${src}`;
                  return `${prefix}${path}`;
                };
                const selectedColorObj = product.colors?.find(c => c.name === selectedColor);
                const colorImages = selectedColorObj?.images || [];
                // Build image list: prefer selected color images, fallback to images[], fallback to [image]
                const imgList: string[] = colorImages.length > 0 ? colorImages : (
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
                    <div className="relative overflow-hidden rounded-xl bg-accent/40 aspect-[6/6] group w-full">
                      {imgList.length > 0 ? (
                        <div 
                          ref={imageScrollRef}
                          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                          onScroll={(e) => {
                            const target = e.target as HTMLDivElement;
                            const index = Math.round(target.scrollLeft / target.clientWidth);
                            if (index !== currentImageIndex) setCurrentImageIndex(index);
                          }}
                        >
                          {imgList.map((img, idx) => (
                            <img
                              key={idx}
                              src={toUrl(img)}
                              alt={`${product.name} ${idx + 1}`}
                              className="flex-shrink-0 w-full h-full object-contain snap-center scrollbar-hide snap-always"
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/15 to-background/40" />
                          <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                            <p className="text-lg sm:text-xl font-semibold text-foreground">Premium Cotton Garments</p>
                          </div>
                        </>
                      )}

                      {/* Left arrow */}
                      {hasPrev && (
                        <button
                          onClick={() => handleImageChange(currentImageIndex - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center hover:bg-background transition-colors shadow-md"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>
                      )}

                      {/* Right arrow */}
                      {hasNext && (
                        <button
                          onClick={() => handleImageChange(currentImageIndex + 1)}
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
                            onClick={() => handleImageChange(idx)}
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
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {imgList.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleImageChange(idx)}
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
              <div className="flex justify-between items-start gap-4 mb-3 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{product.name}</h1>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-2 rounded-full transition-colors flex-shrink-0 ${wishlistStatus ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                  title={wishlistStatus ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-6 w-6 sm:h-7 sm:w-7 ${wishlistStatus ? 'fill-current' : ''}`} />
                </button>
              </div>

              <StarRating
                rating={averageRating}
                totalReviews={reviews.length}
                showText={reviews.length > 0}
                className="flex items-center gap-2 mb-4"
              />
              {reviews.length === 0 && (
                <p className="text-xs text-muted-foreground -mt-3 mb-4 italic">Not yet rated</p>
              )}

              <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed whitespace-pre-wrap">
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
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Select Color</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {product.colors.map((colorObj) => (
                      <button
                        key={colorObj.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(colorObj.name);
                          handleImageChange(0); // Reset image index when changing color
                        }}
                        className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all duration-200 ${
                          selectedColor === colorObj.name
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-black/10 hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: colorObj.hex || '#000000' }}
                        title={colorObj.name}
                        aria-label={`Select color ${colorObj.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {(product.sizes ?? ['S', 'M', 'L', 'XL']).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-12 px-3 rounded-lg border-2 font-semibold transition-all duration-200 flex items-center justify-center whitespace-nowrap shadow-sm ${selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-black/15 bg-background/60 text-foreground hover:border-primary/50 hover:bg-background/80'
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
                  className={`flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2.5 transition-all duration-300 ${
                    product.inStock 
                      ? 'btn-secondary' 
                      : 'bg-muted text-muted-foreground border border-border rounded-lg cursor-not-allowed opacity-70 grayscale'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{product.inStock ? 'Add to Cart' : 'No Stock'}</span>
                  <span className="sm:hidden">{product.inStock ? 'Add' : 'No Stock'}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2.5 transition-all duration-300 ${
                    product.inStock 
                      ? 'btn-primary' 
                      : 'bg-muted text-muted-foreground border border-border rounded-lg cursor-not-allowed opacity-70 grayscale'
                  }`}
                >
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>{product.inStock ? 'Buy Now' : 'No Stock'}</span>
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
