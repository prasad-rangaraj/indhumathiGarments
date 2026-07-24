import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, Mail, RotateCcw, AlertTriangle, Camera, XCircle } from 'lucide-react';
import { useOrdersStore, Order } from '@/stores/ordersStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { resolveItemImage } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const toUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${prefix}${path}`;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, loading, error, authError, fetchOrderById, getOrderById, cancelOrder, requestReturn } = useOrdersStore();
  const { toast } = useToast();
  const [hasFetched, setHasFetched] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const [isReturning, setIsReturning] = useState(false);
  const [returnReasonText, setReturnReasonText] = useState('');
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnImages, setReturnImages] = useState<string[]>([]);

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
    if (orderId) {
      fetchOrderById(orderId, true).finally(() => setHasFetched(true));
    } else {
      setHasFetched(true);
    }
  }, [fetchOrderById, orderId]);

  // Redirect to login if auth failed
  useEffect(() => {
    if (hasFetched && authError) {
      navigate(`/login?redirect=/order/${orderId}`, { replace: true });
    }
  }, [hasFetched, authError, navigate, orderId]);

  const order = orderId ? getOrderById(orderId) : undefined;

  // Show spinner while fetching — avoids flash of "Order not found" on mobile
  if (!hasFetched || loading) {
    return <PremiumLoader />;
  }

  if (!order) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex items-center justify-center px-4 min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Order not found</h2>
            <Link to="/orders" className="btn-primary">Back to Orders</Link>
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle };
      case 'Shipped':
        return { bg: 'bg-pink-100', text: 'text-pink-700', icon: Truck };
      case 'Packed':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: Package };
      case 'Pending':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Package };
      case 'Cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Package };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const isWithin24Hours = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    const orderDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - orderDate) < hours24;
  };

  const isReturnWindowOpen = (order: Order) => {
    if (order.status !== 'Delivered') return false;
    const deliveredDateString = order.updatedAt || order.orderDate;
    if (!deliveredDateString) return false;
    const deliveredDate = new Date(deliveredDateString).getTime();
    const now = new Date().getTime();
    const days7 = 7 * 24 * 60 * 60 * 1000;
    return (now - deliveredDate) <= days7;
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-8 px-4 sm:px-6 relative z-10">
        <div className="sm:mx-auto max-w-4xl">
          <Link to="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="card-elegant p-6 sm:p-8 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
                <p className="text-muted-foreground font-mono mt-1">ID: {order.orderId}</p>
                <p className="text-sm text-muted-foreground mt-1">Placed on {formatDate(order.orderDate)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text} font-semibold`}>
                  <StatusIcon className="w-4 h-4" />
                  {order.status}
                </div>
                {order.status === 'Pending' && isWithin24Hours(order.orderDate) && (
                  <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="font-bold">Cancel Order</Button>
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
                )}
                {order.status !== 'Cancelled' && (
                  <Link to={`/track/${order.orderId}`}>
                    <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 font-bold px-6">
                      Track Order
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {order.status === 'Pending' && isWithin24Hours(order.orderDate) && (
              <div className="mb-8 p-4 bg-pink-50 border border-pink-100 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-pink-800 uppercase tracking-wider">Cancellation Window Open</h3>
                  <p className="text-sm text-pink-700 mt-1">
                    You can still cancel this order within the next few hours if you've changed your mind.
                  </p>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Shipping Address
                </h2>
                <div className="text-muted-foreground space-y-1 bg-gray-50/50 p-4 rounded-lg border border-border/50">
                  <p className="font-bold text-foreground">{order.customerInfo.name}</p>
                  <p>{order.customerInfo.address}</p>
                  <p>{order.customerInfo.city} - {order.customerInfo.pincode}</p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                    <Phone className="w-4 h-4 text-pink-600" />
                    <p className="text-sm">{order.customerInfo.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-pink-600" />
                    <p className="text-sm">{order.customerInfo.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-pink-600" />
                  Order Summary
                </h2>
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-lg border border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-semibold capitalize text-foreground">
                      {order.paymentMethod === 'upi' ? 'UPI' :
                        order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                          'Credit/Debit Card'}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tracking Number:</span>
                      <span className="font-mono font-semibold text-foreground">{order.trackingNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-pink-600">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-0">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-border/60 hover:border-pink-200 transition-colors rounded-xl group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-muted-foreground flex-shrink-0 group-hover:bg-pink-50/50 transition-colors overflow-hidden">
                      {(() => {
                        const imgSrc = resolveItemImage(item);
                        if (imgSrc) {
                          return (
                            <img
                              src={toUrl(imgSrc)}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          );
                        }
                        return <Package className="w-8 h-8 text-pink-200" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">Size: <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">{item.selectedSize || item.size}</span></p>
                        {(item.color || item.selectedColor) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Style: <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded capitalize">{item.color || item.selectedColor}</span>
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">Qty: <span className="font-semibold text-foreground">{item.quantity}</span></p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">Price: <span className="font-semibold text-foreground">₹{item.price}</span></p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-border/40 pl-0 sm:pl-6 pt-3 sm:pt-0">
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-bold">Subtotal</p>
                      <p className="text-xl font-black text-pink-600">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h3 className="font-bold text-foreground">Need help with this order?</h3>
              <p className="text-sm text-muted-foreground">Our support team is here for you 24/7</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50 font-bold" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isReturnWindowOpen(order) && (
        <div className="mx-4 sm:mx-auto max-w-4xl px-4 sm:px-6 mb-8">
          <div className="card-elegant p-6 border-blue-200 bg-blue-50/50">
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
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
