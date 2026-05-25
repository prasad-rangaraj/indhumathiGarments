import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, Ticket, Check, CheckCircle, MapPin, Package, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { couponsAPI, paymentsAPI } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customerInfo, setCustomerInfo] = useState(() => {
    // 1. Check for last order
    const lastOrderStr = localStorage.getItem('lastOrder');
    if (lastOrderStr) {
      try {
        const lastOrder = JSON.parse(lastOrderStr);
        if (lastOrder && lastOrder.customerInfo) {
          return lastOrder.customerInfo;
        }
      } catch (e) {
        console.error("Failed to parse last order", e);
      }
    }

    // 2. Fallback to authStore user
    const { user } = useAuthStore.getState();
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: '',
      pincode: ''
    };
  });

  const [currentStep, setCurrentStep] = useState<number>(2); // 1 = Auth(done), 2 = Address, 3 = Summary, 4 = Payment
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [fetchedCoupons, setFetchedCoupons] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    // Load saved addresses
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      setSavedAddresses(JSON.parse(saved));
    }

    // Fetch active coupons
    couponsAPI.getActive().then(setFetchedCoupons).catch(err => {
      console.error('Failed to fetch coupons:', err);
    });
  }, []);

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    const coupon = fetchedCoupons.find(c => c.code.toUpperCase() === code);

    if (coupon) {
      if (coupon.minAmount && total < coupon.minAmount) {
        setCouponError(`Min order amount ₹${coupon.minAmount} required`);
        toast({
          title: "Minimum Amount Not Met",
          description: `This coupon requires a minimum order of ₹${coupon.minAmount}`,
          variant: "destructive",
        });
        return;
      }

      setAppliedCoupon({ code, discount: coupon.discount });
      setCouponError('');
      toast({
        title: "Coupon applied!",
        description: `You saved ${coupon.discount}%`,
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
    return Math.round((total * appliedCoupon.discount) / 100);
  };

  const finalTotal = total - calculateDiscount();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const orderData = {
    items,
    couponCode: appliedCoupon?.code || null,
    couponDiscount: appliedCoupon?.discount || 0, // % — backend recalculates server-side
    customerInfo,
    paymentMethod,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // COD: direct order creation, no payment gateway
      if (paymentMethod === 'cod') {
        const fullOrderData = {
          orderId: `IND${Date.now()}`,
          ...orderData,
          total: finalTotal,
          originalTotal: total,
          orderDate: new Date().toISOString(),
          status: 'Pending' as const,
          trackingNumber: `TRK${Date.now().toString().slice(-6)}`,
        };
        await createOrder(fullOrderData);
        localStorage.setItem('lastOrder', JSON.stringify(fullOrderData));
        await clearCart();
        toast({ title: 'Order placed!', description: 'Your COD order is confirmed.' });
        navigate('/confirmation');
        return;
      }

      // Online payment: open Razorpay popup
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      // Create Razorpay order on backend (server recalculates price from DB)
      const { razorpayOrderId, amount, currency, serverTotal, keyId } = await paymentsAPI.createOrder(
        items,
        appliedCoupon?.discount
      );

      return new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'Indhumathi Garments',
          description: 'Pure Cotton Women Innerwear',
          order_id: razorpayOrderId,
          prefill: {
            name: customerInfo.name,
            email: customerInfo.email,
            contact: (customerInfo.phone || '').replace(/\D/g, '').slice(-10),
          },
          theme: { color: '#f472b6' }, // Light pink theme
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'UPI / Google Pay / PhonePe',
                  instruments: [{ method: 'upi' }],
                },
              },
              sequence: ['block.upi', 'block.card', 'block.netbanking'],
              preferences: { show_default_blocks: true },
            },
          },
          handler: async (response: any) => {
            try {
              // Verify payment server-side and create order
              const result = await paymentsAPI.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData,
              });
              localStorage.setItem('lastOrder', JSON.stringify({
                ...orderData,
                orderId: result.orderId,
                trackingNumber: result.trackingNumber,
              }));
              await clearCart();
              toast({ title: '🎉 Payment Successful!', description: `Order ${result.orderId} confirmed.` });
              navigate('/confirmation');
              resolve();
            } catch (err: any) {
              toast({ title: 'Payment verification failed', description: err.message, variant: 'destructive' });
              setIsProcessing(false);
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              toast({ title: 'Payment cancelled', description: 'You closed the payment window.', variant: 'destructive' });
              setIsProcessing(false);
              reject(new Error('Payment dismissed'));
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          toast({ title: 'Payment failed', description: response.error.description, variant: 'destructive' });
          setIsProcessing(false);
          reject(new Error(response.error.description));
        });
        rzp.open();
      }).catch(() => { /* handled above */ });

    } catch (error) {
      setIsProcessing(false);
      toast({
        title: 'Order failed',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen relative bg-slate-50/50 pb-20">
      <div className="fixed top-0 left-0 w-full h-[100lvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Secure Checkout</h1>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide">100% SECURE</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Flow Stepper */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* STEP 1: LOGIN */}
              <div className="bg-card border border-border rounded-xl flex items-center justify-between p-4 sm:p-5 shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Login <CheckCircle className="w-4 h-4 text-green-500" />
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">{customerInfo.name || 'Prasad'} <span className="mx-2 text-border">|</span> {customerInfo.email || 'guest@email.com'}</p>
                  </div>
                </div>
              </div>

              {/* STEP 2: DELIVERY ADDRESS */}
              <div className={`bg-card border ${currentStep === 2 ? 'border-primary shadow-md' : 'border-border shadow-sm'} rounded-xl overflow-hidden transition-all duration-300`}>
                <div className={`flex items-center gap-4 p-4 sm:p-5 ${currentStep === 2 ? 'bg-primary/5 border-b border-primary/20' : ''}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded font-bold ${currentStep === 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <h3 className={`font-semibold ${currentStep === 2 ? 'text-primary' : 'text-foreground'} flex items-center gap-2 flex-1`}>
                    Delivery Address {currentStep > 2 && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </h3>
                  {currentStep > 2 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="h-8 text-primary font-semibold hover:bg-primary/10">
                      Change
                    </Button>
                  )}
                </div>

                {currentStep === 2 ? (
                  <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Name</label>
                        <input type="text" name="name" value={customerInfo.name} onChange={handleInputChange} required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="Full name" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Email</label>
                        <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="Email address" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Phone</label>
                        <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="10-digit number" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Pincode</label>
                        <input type="text" name="pincode" value={customerInfo.pincode} onChange={handleInputChange} required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" placeholder="6 digits [0-9]" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-semibold text-foreground">Address (Area and Street)</label>
                        <textarea name="address" value={customerInfo.address} onChange={handleInputChange} required rows={3} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-sm font-semibold text-foreground">City/District/Town</label>
                        <input type="text" name="city" value={customerInfo.city} onChange={handleInputChange} required className="w-full px-3 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm" />
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border flex justify-end">
                      <Button
                        type="button"
                        onClick={(e) => {
                          const form = e.currentTarget.closest('form');
                          if (form && !form.checkValidity()) {
                            form.reportValidity();
                            return;
                          }
                          setCurrentStep(3);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-lg text-base shadow-md"
                      >
                        Deliver Here
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentStep > 2 && (
                    <div className="p-4 sm:p-5 pt-0 text-sm text-foreground">
                      <div className="flex gap-3 bg-muted/30 p-4 rounded-lg">
                        <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">{customerInfo.name} <span className="font-normal text-muted-foreground ml-2">{customerInfo.phone}</span></p>
                          <p className="text-muted-foreground leading-relaxed">{customerInfo.address}, {customerInfo.city} - <span className="font-medium text-foreground">{customerInfo.pincode}</span></p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* STEP 3: ORDER SUMMARY */}
              <div className={`bg-card border ${currentStep === 3 ? 'border-primary shadow-md' : 'border-border shadow-sm'} rounded-xl overflow-hidden transition-all duration-300`}>
                <div className={`flex items-center gap-4 p-4 sm:p-5 ${currentStep === 3 ? 'bg-primary/5 border-b border-primary/20' : ''}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded font-bold ${currentStep === 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>3</div>
                  <h3 className={`font-semibold ${currentStep === 3 ? 'text-primary' : 'text-foreground'} flex items-center gap-2 flex-1`}>
                    Order Summary {currentStep > 3 && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </h3>
                  {currentStep > 3 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(3)} className="h-8 text-primary font-semibold hover:bg-primary/10">
                      Change
                    </Button>
                  )}
                </div>

                {currentStep === 3 ? (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-4 sm:p-6">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md border border-border shrink-0 overflow-hidden bg-accent/20">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-8 h-8 m-auto mt-6 sm:mt-8 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-1">{item.name}</h4>
                            <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                              {item.selectedSize && <span className="bg-muted px-2 py-0.5 rounded">Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span className="bg-muted px-2 py-0.5 rounded flex items-center gap-1">Color: <span className="w-2.5 h-2.5 rounded-full border border-border" style={{backgroundColor: item.selectedColor}} /></span>}
                              <span>Qty: <span className="font-medium text-foreground">{item.quantity}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-base sm:text-lg">₹{item.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 sm:p-6 bg-muted/10 border-t border-border flex justify-between items-center">
                      <p className="text-sm font-medium">Order confirmation email will be sent to <span className="font-bold">{customerInfo.email}</span></p>
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-5 rounded-lg shadow-md"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentStep > 3 && (
                    <div className="p-4 sm:p-5 pt-0 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{items.length} {items.length === 1 ? 'Item' : 'Items'} selected for checkout</p>
                    </div>
                  )
                )}
              </div>

              {/* STEP 4: PAYMENT OPTIONS */}
              <div className={`bg-card border ${currentStep === 4 ? 'border-primary shadow-md' : 'border-border shadow-sm'} rounded-xl overflow-hidden transition-all duration-300`}>
                 <div className={`flex items-center gap-4 p-4 sm:p-5 ${currentStep === 4 ? 'bg-primary/5 border-b border-primary/20' : ''}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded font-bold ${currentStep === 4 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>4</div>
                  <h3 className={`font-semibold ${currentStep === 4 ? 'text-primary' : 'text-foreground'}`}>
                    Payment Options
                  </h3>
                </div>

                {currentStep === 4 && (
                  <div className="p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:bg-muted/50'}`}>
                        <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-primary accent-primary" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-primary" /> Online Payment
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Recommended</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">UPI, Credit/Debit Cards, Netbanking</p>
                          {paymentMethod === 'online' && (
                             <div className="mt-4 animate-in slide-in-from-top-2">
                               <button type="submit" disabled={isProcessing} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-3 rounded-lg shadow-md flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                                  {isProcessing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                  {isProcessing ? 'Processing...' : `Pay ₹${finalTotal}`}
                               </button>
                             </div>
                          )}
                        </div>
                      </label>

                      <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:bg-muted/50'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-primary accent-primary" />
                        <div className="flex-1">
                          <span className="font-semibold text-foreground flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-primary" /> Cash on Delivery
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">Pay when you receive the order</p>
                          {paymentMethod === 'cod' && (
                             <div className="mt-4 animate-in slide-in-from-top-2">
                               <button type="submit" disabled={isProcessing} className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/5 font-bold px-8 py-3 rounded-lg flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                                  {isProcessing ? <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : null}
                                  {isProcessing ? 'Processing...' : `Confirm Order`}
                               </button>
                             </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Price Breakdown Sticky Panel */}
            <div className="lg:col-span-1">
               <div className="bg-card border border-border shadow-sm p-0 rounded-xl sticky top-24 overflow-hidden">
                 
                 <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
                   <h2 className="text-sm uppercase tracking-wider font-bold text-muted-foreground">Price Details</h2>
                 </div>

                 <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground">Price ({items.length} items)</span>
                      <span className="font-medium text-foreground">₹{total}</span>
                    </div>

                    {/* Coupons */}
                    {!appliedCoupon ? (
                      <div className="space-y-2 py-2">
                        <div className="flex gap-2">
                          <Input type="text" placeholder="Enter Coupon Code" value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }} className="h-9 text-sm" />
                          <Button type="button" onClick={handleApplyCoupon} variant="outline" className="h-9 px-3">Apply</Button>
                        </div>
                        {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded text-sm">
                        <div className="flex items-center gap-2 font-semibold text-green-700">
                          <Check className="w-4 h-4" /> {appliedCoupon.code}
                        </div>
                        <button type="button" onClick={handleRemoveCoupon} className="text-xs text-green-700 hover:text-green-800 font-bold uppercase underline decoration-transparent hover:decoration-green-700 transition-all focus:outline-none">Remove</button>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">- ₹{calculateDiscount()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground">Delivery Charges</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>

                    <div className="border-t border-dashed border-border/70 my-4" />

                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total Amount</span>
                      <span>₹{finalTotal}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="text-sm font-semibold text-green-600 bg-green-50 py-2.5 px-3 rounded text-center border border-green-100 mt-4">
                        You will save ₹{calculateDiscount()} on this order
                      </div>
                    )}
                 </div>

                 {/* Trust Badges */}
                 <div className="px-5 py-4 bg-muted/40 border-t border-border/50 flex gap-4 items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-muted-foreground/60" />
                    <p className="text-xs font-semibold text-muted-foreground leading-snug">
                      Safe and Secure Payments.<br/>100% Authentic products.
                    </p>
                 </div>
               </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
