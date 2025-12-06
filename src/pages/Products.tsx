import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import bgProductsHero from '@/assets/bg-products-hero.jpg';

const Products = () => {
  const { products, categories, loading, error, fetchProducts, fetchCategories } = useProductsStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Main categories only (1–5 from your list)
  const mainCategories = Object.keys(categories);

  // Show loading state
  if (loading && mainCategories.length === 0) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <img 
            src={bgProductsHero}
            alt="" 
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>
        <div className="py-8 sm:py-12 px-4 sm:px-6 relative z-10">
          <div className="container mx-auto text-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <img 
            src={bgProductsHero}
            alt="" 
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>
        <div className="py-8 sm:py-12 px-4 sm:px-6 relative z-10">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Products by Type
            </h1>
            <p className="text-red-500 mb-2">Error loading products: {error}</p>
            <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no categories
  if (!loading && mainCategories.length === 0) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <img 
            src={bgProductsHero}
            alt="" 
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>
        <div className="py-8 sm:py-12 px-4 sm:px-6 relative z-10">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Products by Type
            </h1>
            <p className="text-muted-foreground mb-2">No product categories available.</p>
            <p className="text-muted-foreground text-sm">Please add products to the database through the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get product count for a full category
  const getCategoryCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  // Get how many sub-types are inside a category
  const getSubTypeCount = (category: string) => {
    const subTypes = categories[category as keyof typeof categories] || [];
    return subTypes.length;
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with blur - Fixed */}
      <div className="fixed inset-0 -z-10">
        <img 
          src={bgProductsHero}
          alt="" 
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      <div className="py-8 sm:py-12 px-0 sm:px-6 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Products by Type
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a main type to explore all products and styles inside it
            </p>
          </div>

          {/* Main Categories - vertical rectangular cards */}
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
            {mainCategories.map((category, index) => {
              const productCount = getCategoryCount(category);
              const subTypeCount = getSubTypeCount(category);

              return (
                <Link
                  key={category}
                  to={`/category/${encodeURIComponent(category)}`}
                  className="block group"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 hover:shadow-xl hover:border-primary/60 hover:-translate-y-1 transition-all duration-300">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category}
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {productCount} {productCount === 1 ? 'product' : 'products'} · {subTypeCount}{' '}
                        {subTypeCount === 1 ? 'style' : 'styles'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-primary group-hover:underline">
                        View products
                      </span>
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
