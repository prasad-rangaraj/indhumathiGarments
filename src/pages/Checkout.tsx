import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, Ticket, Check } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    // Load saved addresses
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }
  }, []);

  // Mock coupon codes
  const validCoupons: Record<string, number> = {
    'WELCOME10': 10,
    'SAVE20': 20,
    'FIRST50': 50,
    'INDHU25': 25,
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (validCoupons[code]) {
      setAppliedCoupon({ code, discount: validCoupons[code] });
      setCouponError('');
      toast({
        title: "Coupon applied!",
        description: `You saved ${validCoupons[code]}%`,
      });
    } else {
      setCouponError('Invalid coupon code');
      toast({
        title: "Invalid coupon",
        description: "Please check the code and try again",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return Math.round((state.total * appliedCoupon.discount) / 100);
  };

  const finalTotal = state.total - calculateDiscount();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create order
      const orderData = {
        orderId: `IND${Date.now()}`,
        items: items,
        total: finalTotal,
        originalTotal: total,
        discount: calculateDiscount(),
        couponCode: appliedCoupon?.code || null,
        customerInfo,
        paymentMethod,
        orderDate: new Date().toISOString(),
        status: 'Pending' as const,
        trackingNumber: `TRK${Date.now().toString().slice(-6)}`,
      };

      await createOrder(orderData);
      await clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: "Redirecting to confirmation page...",
      });

      navigate('/confirmation');
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background with blur - Fixed */}
      <div className="fixed inset-0 -z-10">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-foreground animate-fade-in">
            Checkout
          </h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Customer Information & Payment */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6 md:space-y-8">
            {/* Customer Information */}
            <div className="card-elegant p-4 sm:p-6 animate-slide-up">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">Customer Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={customerInfo.pincode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="641001"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                    placeholder="Street address, apartment, suite, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card-elegant p-4 sm:p-6 animate-slide-up">
              <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/30 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <Smartphone className="h-5 w-5 text-primary" />
                  <span className="font-medium">UPI Payment</span>
                </label>

                <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/30 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Credit/Debit Card</span>
                </label>

                <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/30 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <Banknote className="h-5 w-5 text-primary" />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-elegant p-4 sm:p-6 sticky top-20 sm:top-24 animate-fade-in">
              <h2 className="text-xl font-bold mb-6 text-foreground">Order Summary</h2>
              
              {/* Coupon Code */}
              <div className="mb-6 pb-6 border-b border-border">
                <label className="block text-sm font-medium text-foreground mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const coupons = [
                        { code: 'WELCOME10', discount: 10, type: 'percent' },
                        { code: 'SAVE500', discount: 500, type: 'fixed' },
                        { code: 'FREESHIP', discount: 0, type: 'freeship' }
                      ];
                      const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
                      if (coupon) {
                        setAppliedCoupon(coupon);
                        setCouponError('');
                        toast({
                          title: "Coupon applied!",
                          description: `Discount applied successfully`,
                        });
                      } else {
                        setCouponError('Invalid coupon code');
                        setAppliedCoupon(null);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                    <span className="text-green-700 font-medium">{appliedCoupon.code} applied</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                      className="text-green-700 hover:text-green-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-accent/70 border border-border flex items-center justify-center text-[8px] text-muted-foreground flex-shrink-0">
                      No Image
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.selectedSize} × {item.quantity}</p>
                      <p className="text-sm font-medium text-primary">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mb-6 pt-4 border-t border-border">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        variant="outline"
                        className="gap-2"
                      >
                        <Ticket className="w-4 h-4" />
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-destructive">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600">-{appliedCoupon.discount}%</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-green-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-₹{calculateDiscount()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="btn-primary w-full hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;