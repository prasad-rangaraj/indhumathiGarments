import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, CreditCard, Star, Heart } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useReviewsStore } from '@/stores/reviewsStore';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/ReviewForm';
import RelatedProducts from '@/components/RelatedProducts';
import RecentlyViewed from '@/components/RecentlyViewed';
import bgInnerwear from '@/assets/bg-innerwear-model.jpg';

const colorPalettes: string[][] = [
  ['bg-rose-500', 'bg-pink-400', 'bg-fuchsia-500'],
  ['bg-sky-500', 'bg-cyan-400', 'bg-blue-500'],
  ['bg-emerald-500', 'bg-lime-400', 'bg-green-500'],
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
  const { fetchReviews, getReviewsByProductId, addReview } = useReviewsStore();
  
  const product = id ? getProductById(id) : undefined;
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (products.length === 0 && !productsLoading) {
      fetchProducts();
    }
  }, [products.length, productsLoading, fetchProducts]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id);
    }
  }, [product?.id, fetchReviews]);

  const reviews = product ? getReviewsByProductId(product.id) : [];

  // Track recently viewed
  useEffect(() => {
    if (product) {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = recent.filter((id: string) => id !== product.id);
      filtered.unshift(product.id);
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
    }
  }, [product]);

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

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize);
    }

    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} (Size: ${selectedSize}${selectedColor ? `, Color: ${selectedColor}` : ''}) added to cart`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before proceeding",
        variant: "destructive"
      });
      return;
    }

    handleAddToCart();
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

  // Default reviews if none exist
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: 1,
      name: 'Priya K.',
      rating: 5,
      title: 'Super soft & comfortable',
      content: 'The cotton quality is amazing and the fit is perfect for daily wear.',
      date: 'Feb 2025',
    },
    {
      id: 2,
      name: 'Anitha R.',
      rating: 4,
      title: 'Great support',
      content: 'Good support without feeling tight. I will definitely order again.',
      date: 'Jan 2025',
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background with blur - Fixed */}
      <div className="fixed inset-0 -z-10">
        <img 
          src={bgInnerwear} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
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
          {/* Product Placeholder instead of image */}
          <div className="animate-fade-in">
            <div className="relative overflow-hidden rounded-xl bg-accent/70 flex items-center justify-center aspect-[4/5]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/15 to-background/40" />
              <div className="relative z-10 text-center px-6">
                <p className="text-xs sm:text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-2">
                  Product Preview
                </p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">
                  Premium Cotton Lingerie
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">{product.name}</h1>
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
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${colorClass} ${
                      selectedColor === colorClass ? 'border-primary ring-2 ring-primary/40' : 'border-background'
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
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${
                      selectedSize === size
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
                className={`btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2.5 min-w-[3rem] ${
                  wishlistStatus ? 'bg-primary/20 text-primary' : ''
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
                  {displayReviews.length} review{displayReviews.length !== 1 && 's'} for this product
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
            </div>

            {/* Vertical Scrollable Reviews */}
            <div className="max-h-80 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {displayReviews.map((review) => (
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

                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Review Form */}
            <ReviewForm 
              productId={product.id} 
              onSubmit={async (reviewData) => {
                await addReview(product.id, reviewData);
              }}
            />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts currentProduct={product} />

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>
    </div>
    </div>
  );
};

export default ProductDetail;