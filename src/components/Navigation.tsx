import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import imgLogo from '@/assets/img-logo.png';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const { isAuthenticated, token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // A user is truly logged in only when BOTH isAuthenticated flag and token are present
  const isLoggedIn = isAuthenticated && !!token;

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  // Products section is active on the gender select, shop, category, and product detail pages
  const isProductsActive =
    location.pathname === '/products' ||
    location.pathname.startsWith('/shop') ||
    location.pathname.startsWith('/category') ||
    location.pathname.startsWith('/product');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={imgLogo} 
              alt="Indhumathi" 
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              About
            </Link>
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isProductsActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Products
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/faq') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              FAQ
            </Link>
          </div>

          {/* Right Side - Search, Wishlist, Cart and Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Search - Desktop */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch} className="flex items-center">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4"
                />
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              </form>
            </div>

            {/* Search Icon - Mobile */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Profile / Login Icon */}
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="relative p-2 hover:bg-accent rounded-lg transition-colors hidden md:flex"
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              </Link>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 ml-2"
              >
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-x border-border/50 rounded-b-2xl px-4 py-4 shadow-xl animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                About
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  isProductsActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Products
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  isActive('/contact') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Contact
              </Link>
              <Link
                to="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                  isActive('/faq') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                FAQ
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile?tab=orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/orders') || (location.pathname === '/profile' && new URLSearchParams(location.search).get('tab') === 'orders') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/wishlist') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    My Wishlist
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Profile / Dashboard
                  </Link>
                </>
              ) : (
                <div className="pt-2">
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Login / Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
