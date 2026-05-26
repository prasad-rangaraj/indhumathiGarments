import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Heart } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import bgFashionModel from '@/assets/bg-fashion-model.png';




const CategoryProducts = () => {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();
  const { products, categories, loading, fetchProducts, getProductsByCategory, getProductsBySubcategory } = useProductsStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { fetchCategories } = useProductsStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
    if (Object.keys(categories).length === 0) {
      fetchCategories();
    }
  }, [products.length, categories, fetchProducts, fetchCategories]);

  const decodedCategory = decodeURIComponent(category || '');
  const categoryData = categories[decodedCategory];

  useEffect(() => {
    if (categoryData) {
      document.title = categoryData.metaTitle || `${categoryData.name} | Indhumathi Garments`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', categoryData.metaDescription || `Explore our premium range of ${categoryData.name} products.`);
      }
    }
    return () => {
      document.title = 'Indhumathi Garments';
    };
  }, [categoryData]);
  
  if (!category) {
    return <Navigate to="/products" replace />;
  }

  const decodedSubcategory = subcategory ? decodeURIComponent(subcategory) : null;
  
  // Filter products based on category and optionally subcategory
  let categoryProducts = decodedSubcategory
    ? getProductsBySubcategory(decodedCategory, decodedSubcategory)
    : getProductsByCategory(decodedCategory);

  // Apply price filter
  if (priceFilter !== 'all') {
    categoryProducts = categoryProducts.filter(p => {
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
  categoryProducts = [...categoryProducts].sort((a, b) => {
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

  if (categoryProducts.length === 0) {
    return <Navigate to="/products" replace />;
  }

  const pageTitle = decodedSubcategory || decodedCategory;
  const productCount = categoryProducts.length;
  const subcategories = categoryData?.subcategories || [];



  return (
    <div className="min-h-screen relative">
      {/* Background with blur - Fixed */}
      <div className="fixed top-0 left-0 w-full h-[100lvh] -z-10 pointer-events-none">
        <img
          src={bgFashionModel}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ objectPosition: 'center 25%' }}
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="sm:mx-4 mx-2 max-w-6xl">

          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground/90 px-4">
              {pageTitle}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Showing all products available in this type, crafted in premium pure cotton for comfort and elegance.
            </p>
          </div>

          {/* Subcategory Filters - Always visible */}
          {subcategories.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-center md:flex-wrap">
                <Link
                  to={`/category/${encodeURIComponent(decodedCategory)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    !decodedSubcategory 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent/50 text-foreground hover:bg-accent'
                  }`}
                >
                  All
                </Link>
                {subcategories.map((sub) => (
                  <Link
                    key={sub}
                    to={`/category/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(sub)}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      decodedSubcategory === sub 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-accent/50 text-foreground hover:bg-accent'
                    }`}
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Count */}
          <div className="flex items-center justify-end mb-6">
            <p className="text-sm text-muted-foreground font-medium">
              {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {categoryProducts.map((product, index) => (
              <div
                key={product.id}
                className="card-product group overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Product Image */}
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

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 text-sm font-bold bg-primary text-primary-foreground rounded-full">
                      ₹{product.price}
                    </span>
                  </div>

                  {/* Subcategory Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-2 py-1 text-xs font-medium bg-background/80 text-foreground rounded">
                      {product.subcategory}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
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
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Product Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                        {product.material}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.sizes.length} sizes
                      </span>
                    </div>
                  </div>

                  {/* Color options */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Available colors</p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((colorObj) => (
                          <div
                            key={colorObj.name}
                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: colorObj.hex || '#000000' }}
                            title={colorObj.name}
                            aria-label={colorObj.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/product/${product.id}`}
                    className="btn-secondary w-full text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;
