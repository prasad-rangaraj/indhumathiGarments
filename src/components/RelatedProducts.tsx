import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductsStore } from '@/stores/productsStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Product } from '@/types';
import { Heart } from 'lucide-react';

interface RelatedProductsProps {
  currentProduct: Product;
}

const RelatedProducts = ({ currentProduct }: RelatedProductsProps) => {
  const { products, fetchProducts } = useProductsStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const related = products
    .filter(p => 
      p.id !== currentProduct.id && 
      (p.category === currentProduct.category || p.subcategory === currentProduct.subcategory)
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="card-product group overflow-hidden"
          >
            <div className="relative overflow-hidden aspect-[4/5] bg-accent/60 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background/40" />
              <div className="relative z-10 text-center px-2">
                <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                  {product.name}
                </p>
              </div>
              <div className="absolute top-2 right-2 z-20">
                <span className="px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  ₹{product.price}
                </span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                  }}
                  className="p-1 rounded-full hover:bg-accent transition-colors flex-shrink-0 sm:hidden"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
