import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Heart } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';



const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, loading, fetchProducts, searchProducts, categories } = useProductsStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [searchTerm, setSearchTerm] = useState(query);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Filter products
  let baseProducts = query ? searchProducts(query) : products;
  let filteredProducts = baseProducts.filter(p => categoryFilter === 'all' || p.category === categoryFilter);

  // Apply price filter
  if (priceFilter !== 'all') {
    filteredProducts = filteredProducts.filter(p => {
      switch (priceFilter) {
        case 'under500': return p.price < 500;
        case '500-1000': return p.price >= 500 && p.price <= 1000;
        case '1000-2000': return p.price > 1000 && p.price <= 2000;
        case 'over2000': return p.price > 2000;
        default: return true;
      }
    });
  }

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  const categoryList = Object.keys(categories);

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 sm:px-6 relative z-10">
        <div className="mx-6 sm:mx-auto max-w-6xl">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>
          </form>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 break-words">
                {query ? `Search Results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product found' : 'products found'}
              </p>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="card-product group overflow-hidden"
                >
                  <div className="relative overflow-hidden aspect-[4/5] bg-accent/60 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}${product.image}`}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
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
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                        }}
                        className="p-1.5 rounded-full hover:bg-accent transition-colors flex-shrink-0"
                        aria-label="Toggle wishlist"
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                        {product.material}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.colors && product.colors.length > 0 ? (
                        product.colors.map((color: any, idx: number) => {
                          const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                          const toUrl = (src: string) => {
                            if (!src) return '';
                            if (src.startsWith('http')) return src;
                            const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
                            return `${prefix}${src.startsWith('/') ? src : `/${src}`}`;
                          };
                          const thumbSrc = color.primaryImage || color.images?.[0];
                          if (product.showColorThumbnails && thumbSrc) {
                            return (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-md border border-border/60 shadow-sm overflow-hidden flex-shrink-0"
                                title={color.name}
                              >
                                <img src={toUrl(thumbSrc)} alt={color.name} className="w-full h-full object-cover" />
                              </div>
                            );
                          }
                          return (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded-full border border-border shadow-sm flex-shrink-0"
                              style={{ backgroundColor: color.hex || '#ccc' }}
                              title={color.name}
                            />
                          );
                        })
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border bg-slate-200" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">No products found</p>
              <p className="text-sm text-muted-foreground mb-6">Try adjusting your search or filters</p>
              <Link to="/products" className="btn-primary">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
