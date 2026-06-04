import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { resolveItemImage } from '@/lib/utils';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';



const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const toUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  if (src.startsWith('products/') || src.startsWith('categories/')) {
    return `https://indhumathi-garments-images.s3.ap-south-1.amazonaws.com/${src}`;
  }
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${prefix}${path}`;
};

const Wishlist = () => {
  const { items, removeFromWishlist, fetchWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  const handleAddToCart = async (product: any) => {
    if (product.sizes && product.sizes.length > 0) {
      await addItem(product, product.sizes[0]);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart`,
      });
    } else {
      toast({
        title: "Cannot add to cart",
        description: "Product size not available",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex items-center justify-center px-4 min-h-screen">
          <div className="text-center animate-fade-in">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">Add some beautiful cotton lingerie to your wishlist!</p>
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="mx-4 sm:mx-auto max-w-6xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground animate-fade-in">
            My Wishlist ({items.length})
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {items.map((product, index) => (
              <div
                key={product.id}
                className="card-product group overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link 
                  to={`/product/${product.id}${product.wishlistColor ? `?color=${encodeURIComponent(product.wishlistColor)}` : ''}`}
                  className="relative overflow-hidden aspect-[4/5] bg-accent/60 flex items-center justify-center block"
                >
                  {resolveItemImage(product) ? (
                    <img
                      src={toUrl(resolveItemImage(product) as string)}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background/40" />
                      <div className="relative z-10 text-center">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide uppercase">
                          Indhumathi Collection
                        </p>
                      </div>
                    </>
                  )}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 text-sm font-bold bg-primary text-primary-foreground rounded-full">
                      ₹{product.price}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(product.id);
                    }}
                    className="absolute top-4 left-4 z-20 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </Link>

                <div className="p-4 sm:p-6">
                  <Link 
                    to={`/product/${product.id}${product.wishlistColor ? `?color=${encodeURIComponent(product.wishlistColor)}` : ''}`}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                      {product.material}
                    </span>
                    {product.wishlistColor && (
                      <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded capitalize">
                        Color: {product.wishlistColor}
                      </span>
                    )}
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {product.colors.map((colorObj) => {
                        const thumbSrc = colorObj.primaryImage || colorObj.images?.[0];
                        if (product.showColorThumbnails && thumbSrc) {
                          return (
                            <div
                              key={colorObj.name}
                              className="w-8 h-8 rounded-md border border-border/60 shadow-sm overflow-hidden flex-shrink-0"
                              title={colorObj.name}
                            >
                              <img src={toUrl(thumbSrc)} alt={colorObj.name} className="w-full h-full object-cover" />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={colorObj.name}
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: colorObj.hex || '#000000' }}
                            title={colorObj.name}
                          />
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="btn-secondary flex-1 text-center text-sm sm:text-base py-2.5"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 min-w-[3rem]"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
