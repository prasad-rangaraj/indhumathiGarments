import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductsStore } from '@/stores/productsStore';
import CouponBanner from '@/components/CouponBanner';
import { Skeleton } from '@/components/ui/skeleton';
import bgFashionModel from '@/assets/bg-fashion-model.png';
import bgMensFashionModel from '@/assets/bg-mens-fashion-model.png';
import { motion } from 'framer-motion';

const Products = () => {
  const { products, categories, loading, error, fetchProducts, fetchCategories } = useProductsStore();
  const [searchParams] = useSearchParams();
  const gender = searchParams.get('gender') as 'women' | 'men' | null;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const allCategories = Object.keys(categories);

  // Filter categories: only show categories that have at least one product matching the selected gender (or any if no gender selected)
  const mainCategories = allCategories.filter(cat => {
    const productsInCat = products.filter(p => p.category === cat);
    if (gender) {
      return productsInCat.some(p => p.gender === gender || p.gender === 'unisex' || !p.gender);
    }
    return productsInCat.length > 0;
  });

  const genderLabel = gender === 'women' ? "Women's Collection" : gender === 'men' ? "Men's Collection" : 'All Products';
  const themeColor = 'from-primary to-secondary';
  const themeAccent = 'hsl(var(--primary))';
  const themeAccentFaint = 'hsl(var(--primary) / 0.2)';
  const themeAccentHover = 'hsl(var(--primary) / 0.5)';

  // Error state
  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={gender === 'men' ? bgMensFashionModel : bgFashionModel} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
        </div>
        <div className="py-8 px-4 relative z-10 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const getCategoryCount = (category: string) => products.filter(p => p.category === category).length;
  const getSubTypeCount = (category: string) => {
    const subTypes = categories[category as keyof typeof categories] || [];
    return subTypes.length;
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={gender === 'men' ? bgMensFashionModel : bgFashionModel} alt="" className="w-full h-full object-cover transition-opacity duration-500" style={{ objectPosition: 'center 25%' }} />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
      </div>

      {/* Coupon Ticker Banner */}
      <CouponBanner />

      <div className="py-8 sm:py-12 px-0 sm:px-6 relative z-10">
        <div className="px-5">


          {/* Header */}
          <motion.div
            className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {gender && (
              <div className="flex justify-center mb-4">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-white/70 backdrop-blur-sm border border-primary/20 text-primary shadow-sm`}
                >
                  {gender === 'women' ? '♀  She — For Her' : '♂  He — For Him'}
                </motion.span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground/90">
              {genderLabel}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a type to explore all products and styles
            </p>
          </motion.div>

          {/* Categories */}
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 sm:px-0">
            {loading && mainCategories.length === 0 ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))
            ) : mainCategories.length === 0 ? (
              <p className="text-center text-muted-foreground">No categories available. Add products via the admin panel.</p>
            ) : (
              mainCategories.map((category, index) => {
                const productCount = getCategoryCount(category);
                const subTypeCount = getSubTypeCount(category);

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  >
                    <Link
                      to={`/category/${encodeURIComponent(category)}${gender ? `?gender=${gender}` : ''}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-2xl px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 transition-all duration-300 shadow-sm hover:shadow-xl border border-pink-100 hover:border-pink-300">
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                            {category}
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {productCount} {productCount === 1 ? 'product' : 'products'} · {subTypeCount}{' '}
                            {subTypeCount === 1 ? 'style' : 'styles'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-medium group-hover:underline text-primary">
                            View products
                          </span>
                          <motion.div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-primary/20"
                            whileHover={{ scale: 1.15, backgroundColor: 'hsl(var(--primary) / 0.35)' }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform text-primary" />
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
