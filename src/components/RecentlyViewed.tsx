import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductsStore } from '@/stores/productsStore';

const RecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const { products, fetchProducts, getProductById } = useProductsStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const recent = recentIds
      .map((id: string) => getProductById(id))
      .filter(Boolean)
      .slice(0, 4);
    setRecentProducts(recent);
  }, [products, getProductById]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentProducts.map((product) => (
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
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
