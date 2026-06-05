import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Camera,
  XCircle,
} from 'lucide-react';
import { useOrdersStore, Order } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import { resolveItemImage } from '@/lib/utils';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';



// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'Pending',
    label: 'Order Placed',
    sub: 'We have received your order',
    icon: Clock,
    color: 'orange',
    doneColor: '#f97316',
    ringColor: '#fed7aa',
  },
  {
    key: 'Packed',
    label: 'Packed',
    sub: 'Your order is being packed',
    icon: Package,
    color: 'purple',
    doneColor: '#a855f7',
    ringColor: '#e9d5ff',
  },
  {
    key: 'Shipped',
    label: 'Shipped',
    sub: 'Out for delivery',
    icon: Truck,
    color: 'pink',
    doneColor: '#db2777',
    ringColor: '#fbcfe8',
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    sub: 'Package delivered!',
    icon: CheckCircle,
    color: 'green',
    doneColor: '#22c55e',
    ringColor: '#bbf7d0',
  },
] as const;

const STATUS_ORDER = ['Pending', 'Packed', 'Shipped', 'Delivered'] as const;

const RETURN_STEPS = [
  {
    key: 'Return Requested',
    label: 'Requested',
    sub: 'Return request submitted',
    icon: RotateCcw,
    color: 'orange',
    doneColor: '#f97316',
    ringColor: '#fed7aa',
  },
  {
    key: 'Return Picked Up',
    label: 'Picked Up',
    sub: 'Item picked up by courier',
    icon: Truck,
    color: 'blue',
    doneColor: '#3b82f6',
    ringColor: '#bfdbfe',
  },
  {
    key: 'Refund Processed',
    label: 'Processed',
    sub: 'Refund has been initiated',
    icon: CreditCard,
    color: 'purple',
    doneColor: '#a855f7',
    ringColor: '#e9d5ff',
  },
  {
    key: 'Refund Completed',
    label: 'Completed',
    sub: 'Refund credited successfully',
    icon: CheckCircle,
    color: 'green',
    doneColor: '#22c55e',
    ringColor: '#bbf7d0',
  },
] as const;

const RETURN_STATUS_ORDER = ['Return Requested', 'Return Picked Up', 'Refund Processed', 'Refund Completed'] as const;

const getStepIndex = (status: string) => {
  if (RETURN_STATUS_ORDER.includes(status as any)) {
    return RETURN_STATUS_ORDER.indexOf(status as any);
  }
  return STATUS_ORDER.indexOf(status as any);
};

// ─── Component ───────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const toUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${prefix}${path}`;
};

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, loading, fetchOrders, cancelOrder, requestReturn } = useOrdersStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasFetched, setHasFetched] = useState(false);
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const [isReturning, setIsReturning] = useState(false);
  const [returnReasonText, setReturnReasonText] = useState('');
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (returnImages.length + files.length > 5) {
      toast({ title: "Limit reached", description: "You can only upload up to 5 images.", variant: "destructive" });
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: `"${file.name}" exceeds 2MB. Please compress the image.`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturnImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReturnImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Not logged in — redirect to login, then come back
      navigate(`/login?redirect=/track/${orderId}`, { replace: true });
      return;
    }
    // Force a fresh fetch on page load to see the latest status
    fetchOrders(undefined, true).finally(() => setHasFetched(true));
  }, [fetchOrders, isAuthenticated, orderId, navigate]);

  const order: Order | undefined = orders.find((o) => o.orderId === orderId);

  const currentStep = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';
  const isReturnRejected = order?.status === 'Return Rejected';
  const isReturnFlow = order ? RETURN_STATUS_ORDER.includes(order.status as any) : false;
  const activeSteps = isReturnFlow ? RETURN_STEPS : STEPS;

  const progressPct =
    (!isCancelled && !isReturnRejected && currentStep >= 0)
      ? (currentStep / (activeSteps.length - 1)) * 100
      : 0;

  const formatDate = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '—';

  const isWithin24Hours = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    const orderDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - orderDate) < hours24;
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!hasFetched || loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Loading order details…</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="card-elegant p-10 text-center max-w-md mx-4">
          <ShoppingBag className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Order Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn't find order <span className="font-mono font-semibold">{orderId}</span>.
          </p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative">
      {/* BG */}
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-8 px-4 sm:px-6 relative z-10">
        <div className="sm:mx-auto max-w-3xl">

          {/* Back */}
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </Link>

          {/* ── Header card ────────────────────────────────────────────── */}
          <div className="card-elegant p-6 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Order ID</p>
                <h1 className="text-lg font-bold font-mono text-foreground">{order.orderId}</h1>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Order Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(order.orderDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Est. Delivery</p>
                  <p className="text-sm font-bold text-green-600">
                    {order.status !== 'Delivered' && order.delayedDeliveryDate ? (
                      <span className="text-red-500">
                        {new Date(order.delayedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    ) : (() => {
                      const d = new Date(order.orderDate);
                      d.setDate(d.getDate() + 7);
                      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {order.status === 'Pending' && isWithin24Hours(order.orderDate) && (
            <div className="card-elegant p-6 mb-4 border-pink-200 bg-pink-50/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-pink-100 rounded-full mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-pink-800">Order Cancellation</h3>
                  <p className="text-sm text-pink-700 mt-1">
                    You can cancel your order within 24 hours of placement.
                  </p>
                  <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="mt-4">Cancel Order</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel this order? This action cannot be undone. Please provide a reason to help us improve.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Cancellation Reason <span className="text-red-500">*</span></label>
                          <Textarea 
                            placeholder="Why do you wish to cancel?"
                            value={cancelReasonText}
                            onChange={(e) => setCancelReasonText(e.target.value)}
                            disabled={isCancelling}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>
                          Keep Order
                        </Button>
                        <Button 
                          variant="destructive"
                          disabled={isCancelling || cancelReasonText.trim() === ''}
                          onClick={async () => {
                            setIsCancelling(true);
                            try {
                              await cancelOrder(order.orderId, cancelReasonText);
                              toast({ title: 'Order Cancelled', description: 'Your order has been successfully cancelled.' });
                              setIsCancelDialogOpen(false);
                            } catch (err) {
                              toast({ title: 'Failed to cancel', description: 'Could not cancel order', variant: 'destructive' });
                            } finally {
                              setIsCancelling(false);
                            }
                          }}
                        >
                          {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}

          {/* ── Progress Stepper card ───────────────────────────────────── */}
          <div className="card-elegant p-6 sm:p-8 mb-4">
            <h2 className="text-base font-semibold text-foreground mb-8 flex items-center gap-2">
              {isReturnFlow ? <RotateCcw className="w-4 h-4 text-primary" /> : <Truck className="w-4 h-4 text-primary" />}
              {isReturnFlow ? 'Return & Refund Status' : 'Shipment Status'}
            </h2>

            {order.status !== 'Delivered' && order.delayReason && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-700">Delivery Delayed</h3>
                  <p className="text-sm text-red-600 mt-1">{order.delayReason}</p>
                </div>
              </div>
            )}

            {isCancelled ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl">✕</span>
                </div>
                <p className="text-red-600 font-semibold text-lg">Order Cancelled</p>
                <p className="text-muted-foreground text-sm">This order has been cancelled.</p>
              </div>
            ) : isReturnRejected ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl text-red-600">✕</span>
                </div>
                <p className="text-red-600 font-semibold text-lg">Return Rejected</p>
                <p className="text-muted-foreground text-sm text-center max-w-sm">
                  Your return request was reviewed and rejected by our team. Please contact support for further details.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop stepper */}
                <div className="hidden sm:block">
                  <div className="relative">
                    {/* Background track */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-border rounded-full z-0" />
                    {/* Filled progress */}
                    <div
                      className="absolute top-6 left-0 h-1 rounded-full z-0 transition-all duration-700 ease-out"
                      style={{
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #f97316, #a855f7, #3b82f6, #22c55e)',
                      }}
                    />

                    {/* Steps */}
                    <div className="relative z-10 flex justify-between">
                      {activeSteps.map((step, idx) => {
                        const done = idx <= currentStep;
                        const active = idx === currentStep;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center w-1/4">
                            {/* Circle */}
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 mb-3"
                              style={{
                                background: done ? step.doneColor : 'var(--color-card, #fff)',
                                border: done ? `2px solid ${step.doneColor}` : '2px solid var(--color-border)',
                                boxShadow: active
                                  ? `0 0 0 4px ${step.ringColor}`
                                  : undefined,
                              }}
                            >
                              <Icon
                                className="w-5 h-5"
                                style={{ color: done ? '#fff' : 'var(--color-muted-foreground)' }}
                              />
                            </div>
                            <p
                              className="text-sm font-semibold text-center leading-tight"
                              style={{ color: done ? step.doneColor : 'var(--color-muted-foreground)' }}
                            >
                              {step.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground text-center mt-0.5 leading-tight max-w-[80px]">
                              {step.sub}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile stepper (vertical) */}
                <div className="sm:hidden relative">
                  {/* Vertical track */}
                  <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-border rounded-full z-0" />

                  <div className="space-y-0">
                    {activeSteps.map((step, idx) => {
                      const done = idx <= currentStep;
                      const active = idx === currentStep;
                      const Icon = step.icon;
                      const isLast = idx === activeSteps.length - 1;

                      return (
                        <div key={step.key} className={`relative flex gap-4 ${isLast ? '' : 'pb-8'}`}>
                          {/* Filled segment */}
                          {!isLast && done && (
                            <div
                              className="absolute left-[19px] top-5 bottom-0 w-0.5 transition-all duration-700 z-0"
                              style={{ background: step.doneColor }}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 bg-background"
                            style={{
                              background: done ? step.doneColor : 'var(--color-card, #fff)',
                              border: done ? `2px solid ${step.doneColor}` : '2px solid var(--color-border)',
                              boxShadow: active ? `0 0 0 4px ${step.ringColor}` : undefined,
                            }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: done ? '#fff' : 'var(--color-muted-foreground)' }}
                            />
                          </div>

                          {/* Text */}
                          <div className="pt-1.5">
                            <p
                              className="text-sm font-semibold leading-tight"
                              style={{ color: done ? step.doneColor : 'var(--color-muted-foreground)' }}
                            >
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {order.status === 'Delivered' && (
            <div className="card-elegant p-6 mb-4 border-blue-200 bg-blue-50/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-full mt-0.5">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-800">Return & Exchange</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Not satisfied? You can return or exchange this order within 7 days of delivery.
                  </p>
                  <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100">Request Return</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Return</DialogTitle>
                        <DialogDescription>
                          Please let us know why you are returning this item. You can also upload images to help us process your request faster.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Return Reason <span className="text-red-500">*</span></label>
                          <Textarea 
                            placeholder="Why are you returning this?"
                            value={returnReasonText}
                            onChange={(e) => setReturnReasonText(e.target.value)}
                            disabled={isReturning}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Photos (Optional, max 5)</label>
                          <div className="flex flex-wrap gap-4">
                            {returnImages.map((img, idx) => (
                              <div key={idx} className="relative w-20 h-20 group">
                                <img src={img} alt="upload" className="w-full h-full object-cover rounded-lg border border-border" />
                                <button 
                                  onClick={() => removeImage(idx)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            ))}
                            {returnImages.length < 5 && (
                              <label className="w-20 h-20 border-2 border-dashed border-blue-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors group">
                                <Camera className="w-6 h-6 text-blue-300 group-hover:text-blue-500" />
                                <span className="text-[10px] text-blue-400 mt-1">Add Photo</span>
                                <span className="text-[9px] text-blue-300 mt-0.5">Max 2MB</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                              </label>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Uploading an image (under 2MB) helps us respond faster.</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)} disabled={isReturning}>
                          Cancel
                        </Button>
                        <Button 
                          disabled={isReturning || returnReasonText.trim() === ''}
                          onClick={async () => {
                            setIsReturning(true);
                            try {
                              await requestReturn(order.orderId, returnReasonText, returnImages);
                              toast({ title: 'Return Requested', description: 'Your return request has been submitted successfully.' });
                              setIsReturnDialogOpen(false);
                            } catch (err) {
                              toast({ title: 'Failed to request return', description: 'Could not submit request', variant: 'destructive' });
                            } finally {
                              setIsReturning(false);
                            }
                          }}
                        >
                          {isReturning ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}

          {/* ── Order Items card ────────────────────────────────────────── */}
          <div className="card-elegant p-6 mb-4">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Order Items
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </span>
            </h2>

            <div className="divide-y divide-border/40">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 rounded-lg bg-accent/60 border border-border flex items-center justify-center text-[9px] text-muted-foreground flex-shrink-0 overflow-hidden">
                    {(() => {
                      const imgSrc = resolveItemImage(item);
                      return imgSrc ? (
                        <img 
                          src={toUrl(imgSrc)} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        "IMG"
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>Size: {item.selectedSize || item.size}</span>
                      {item.color && (
                        <span className="flex items-center gap-1">
                          · Color:
                          <span className="w-3.5 h-3.5 rounded-full border border-border shadow-sm inline-block" style={{ backgroundColor: item.color }} title={item.color} />
                        </span>
                      )}
                      <span>· Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : order.paymentMethod === 'upi'
                  ? 'UPI'
                  : 'Card'}
              </span>
              <span className="text-lg font-bold text-primary">
                ₹{Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── Delivery Address card ───────────────────────────────────── */}
          <div className="card-elegant p-6 mb-4">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Delivery Address
            </h2>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{order.customerInfo.name}</p>
              <p>{order.customerInfo.address}</p>
              <p>
                {order.customerInfo.city}{order.customerInfo.city && order.customerInfo.pincode ? ' – ' : ''}
                {order.customerInfo.pincode}
              </p>
              {order.customerInfo.phone && (
                <p className="flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  {order.customerInfo.phone}
                </p>
              )}
              {order.customerInfo.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {order.customerInfo.email}
                </p>
              )}
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link to="/orders" className="btn-secondary flex items-center justify-center gap-2 flex-1">
              <ArrowLeft className="w-4 h-4" />
              My Orders
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
