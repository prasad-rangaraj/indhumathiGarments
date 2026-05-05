import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

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

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, loading, fetchProducts, searchProducts, categories } = useProductsStore();
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
  let filteredProducts = query 
    ? searchProducts(query)
    : products.filter(p => {
    const matchesSearch = !query || 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(query.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    
      return matchesCategory;
    });

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
      <div className="fixed inset-0 -z-10">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto">
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
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Filters</span>
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full xs:w-[160px] sm:w-[180px] text-xs sm:text-sm">
                  <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-card/95 backdrop-blur-md rounded-lg border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryList.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under500">Under ₹500</SelectItem>
                      <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                      <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                      <SelectItem value="over2000">Over ₹2,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

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
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                        {product.material}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {getColorsForProduct(product.id).slice(0, 3).map((colorClass) => (
                        <div
                          key={colorClass}
                          className={`w-6 h-6 rounded-full border-2 border-background shadow-sm ${colorClass}`}
                        />
                      ))}
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
