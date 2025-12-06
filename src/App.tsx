import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Navigation from "./components/Navigation";
import About from "./pages/About";
import Login from "./pages/Login";
import Products from "./pages/Products";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import SearchResults from "./pages/SearchResults";
import Wishlist from "./pages/Wishlist";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import Categories from "./pages/admin/Categories";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import AdminOrderDetails from "./pages/admin/OrderDetails";
import Customers from "./pages/admin/Customers";
import Enquiries from "./pages/admin/Enquiries";
import Banners from "./pages/admin/Banners";
import Reviews from "./pages/admin/Reviews";
import Coupons from "./pages/admin/Coupons";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <WishlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes with Navigation */}
              <Route path="/" element={<Login />} />
              <Route path="/about" element={<><Navigation /><About /></>} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<><Navigation /><Products /></>} />
              <Route path="/search" element={<><Navigation /><SearchResults /></>} />
              <Route path="/category/:category" element={<><Navigation /><CategoryProducts /></>} />
              <Route path="/category/:category/:subcategory" element={<><Navigation /><CategoryProducts /></>} />
              <Route path="/product/:id" element={<><Navigation /><ProductDetail /></>} />
              <Route path="/contact" element={<><Navigation /><Contact /></>} />
              <Route path="/cart" element={<><Navigation /><Cart /></>} />
              <Route path="/checkout" element={<><Navigation /><Checkout /></>} />
              <Route path="/confirmation" element={<><Navigation /><Confirmation /></>} />
              <Route path="/wishlist" element={<><Navigation /><Wishlist /></>} />
              <Route path="/orders" element={<><Navigation /><OrderHistory /></>} />
              <Route path="/order/:orderId" element={<><Navigation /><OrderDetails /></>} />
              <Route path="/track/:trackingNumber" element={<><Navigation /><OrderTracking /></>} />
              <Route path="/faq" element={<><Navigation /><FAQ /></>} />
              <Route path="/terms" element={<><Navigation /><Terms /></>} />
              <Route path="/privacy" element={<><Navigation /><Privacy /></>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/categories" element={<Categories />} />
              <Route path="products/inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetails />} />
              <Route path="customers" element={<Customers />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="banners" element={<Banners />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </WishlistProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
