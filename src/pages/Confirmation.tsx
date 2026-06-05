import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Clock, Phone, Info } from 'lucide-react';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';
import { resolveItemImage } from '@/lib/utils';
import { useOrdersStore, Order } from '@/stores/ordersStore';
import type { CartItem } from '@/stores/cartStore';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const toUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${prefix}${path}`;
};

const Confirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Always fetch fresh from DB — no localStorage involved
    fetchOrders(undefined, true).finally(() => setHasFetched(true));
  }, [fetchOrders]);

  const orderData: Order | undefined = orders.find(o => o.orderId === orderId);

  // Show spinner until first fetch completes
  if (!hasFetched || loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex items-center justify-center px-4 min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Order not found</h2>
            <p className="text-muted-foreground mb-6">This order does not exist or you do not have access to it.</p>
            <Link to="/" className="btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4">
        <div className="mx-3 sm:mx-auto max-w-3xl">
          {/* Success Animation */}
          <div className="text-center mb-8 sm:mb-12 animate-zoom-in">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 animate-bounce" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-4">Order Confirmed!</h1>
            <p className="text-sm sm:text-lg text-muted-foreground px-4">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          <div className="card-elegant p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-medium">{orderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span className="font-medium">{formatDate(orderData.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {orderData.paymentMethod === 'upi' ? 'UPI' :
                        orderData.paymentMethod === 'cod' ? 'Cash on Delivery' :
                          'Credit/Debit Card'}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{orderData.total}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Shipping Address</h2>
                <div className="text-muted-foreground">
                  <p className="font-medium text-foreground">{orderData.customerInfo.name}</p>
                  <p>{orderData.customerInfo.address}</p>
                  <p>{orderData.customerInfo.city} - {orderData.customerInfo.pincode}</p>
                  <p>{orderData.customerInfo.phone}</p>
                  <p>{orderData.customerInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderData.items.map((item: CartItem) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-4 bg-accent/30 rounded-lg">
                    <div className="w-16 h-16 rounded bg-accent/70 border border-border flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                      {(() => {
                        const imgSrc = resolveItemImage(item);
                        return imgSrc ? (
                          <img 
                            src={toUrl(imgSrc)} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          "No Image"
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="card-elegant p-6 text-center animate-slide-up">
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Order Processing</h3>
              <p className="text-sm text-muted-foreground">
                Your order is being prepared and will be shipped within 2-3 business days.
              </p>
            </div>

            <div className="card-elegant p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Expected Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Your order will be delivered within 5-7 business days.
              </p>
            </div>

            <div className="card-elegant p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Customer Support</h3>
              <p className="text-sm text-muted-foreground">
                Need help? Call us at +91 87546 09226 or email support@indhumathi.com
              </p>
            </div>
          </div>

          {/* Cancellation & Return Policy */}
          <div className="card-elegant p-6 sm:p-7 mb-6 sm:mb-8 border-pink-100 bg-pink-50/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-pink-100 rounded-full mt-0.5">
                <Info className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-foreground mb-2">Cancellation & Return Policy</h2>
                <p className="text-xs sm:text-sm font-medium text-pink-800 mb-3 bg-pink-100/50 p-3 rounded-md border border-pink-200">
                  Note: You can cancel your order within 24 hours of placement directly from your Order Tracking page.
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                  <li>Easy 7-day return from the date of delivery for size issues or manufacturing defects.</li>
                  <li>Products must be unused, with tags attached and in original packing.</li>
                  <li>For hygiene reasons, worn or washed innerwear cannot be accepted for return.</li>
                  <li>To start a return, contact our support team with your Order ID and product details.</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              For any questions, reach us at <span className="font-medium text-foreground">support@indhumathi.com</span> or
              call <span className="font-medium text-foreground">+91 87546 09226</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary text-center">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-secondary text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
