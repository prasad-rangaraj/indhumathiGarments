import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navigation from "./components/Navigation";
import { PullToRefresh } from "./components/PullToRefresh";
import { PremiumLoader } from "./components/ui/PremiumLoader";

// Layouts and Auth
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import StoreLayout from "./components/StoreLayout";

// Lazy Loaded Pages
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const GenderSelect = lazy(() => import("./pages/GenderSelect"));
const Products = lazy(() => import("./pages/Products"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Lazy Loaded Admin Pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Inventory = lazy(() => import("./pages/admin/Inventory"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetails = lazy(() => import("./pages/admin/OrderDetails"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const Enquiries = lazy(() => import("./pages/admin/Enquiries"));
const Returns = lazy(() => import("./pages/admin/Returns"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Settings = lazy(() => import("./pages/admin/Settings"));

const queryClient = new QueryClient();

const AppInner = () => {
  const { refreshUser, isAuthenticated } = useAuthStore();
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PullToRefresh>
          <BrowserRouter>
            <AppInner />
          <Suspense fallback={<PremiumLoader />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public Store Routes */}
              <Route element={<StoreLayout />}>
                <Route index element={<About />} />
                <Route path="/products" element={<GenderSelect />} />
                <Route path="/shop" element={<Products />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/category/:category" element={<CategoryProducts />} />
                <Route path="/category/:category/:subcategory" element={<CategoryProducts />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              {/* Protected Store Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<StoreLayout />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/confirmation/:orderId" element={<Confirmation />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/orders" element={<Navigate to="/profile?tab=orders" replace />} />
                  <Route path="/order/:orderId" element={<OrderDetails />} />
                  <Route path="/track/:orderId" element={<OrderTracking />} />
                </Route>
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/edit/:id" element={<EditProduct />} />
                  <Route path="products/categories" element={<Categories />} />
                  <Route path="products/inventory" element={<Inventory />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="audit-logs" element={<AuditLogs />} />
                  <Route path="returns" element={<Returns />} />
                  <Route path="enquiries" element={<Enquiries />} />
                  <Route path="banners" element={<Banners />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </PullToRefresh>
      </TooltipProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
