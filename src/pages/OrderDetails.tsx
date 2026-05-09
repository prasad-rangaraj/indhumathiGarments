import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, Mail, RotateCcw, AlertTriangle, Camera, XCircle } from 'lucide-react';
import { useOrdersStore, Order } from '@/stores/ordersStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders, loading, fetchOrders, getOrderById, cancelOrder } = useOrdersStore();
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

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
    // Force a fresh fetch on page load to see the latest status
    fetchOrders(undefined, true);
  }, [fetchOrders]);

  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-screen h-[100dvh] -z-10 pointer-events-none">
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

  const formatDate = (dateString: string) => {
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

  const isWithin24Hours = (dateString: string) => {
    const orderDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    return (now - orderDate) < hours24;
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-screen h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
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
                        const imgSrc = item.product?.image || item.product?.images?.[0] || item.image;
                        if (imgSrc) {
                          return (
                            <img 
                              src={imgSrc.startsWith('http') ? imgSrc : `${import.meta.env.VITE_API_URL.replace('/api', '')}${imgSrc}`}
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
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                        <p className="text-sm text-muted-foreground">Size: <span className="font-semibold text-foreground">{item.selectedSize}</span></p>
                        <p className="text-sm text-muted-foreground text-right sm:text-left">Qty: <span className="font-semibold text-foreground">{item.quantity}</span></p>
                        <p className="text-sm text-muted-foreground">Price: <span className="font-semibold text-foreground">₹{item.price}</span></p>
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
              {order.status === 'Delivered' && (
                <Button className="bg-pink-600 hover:bg-pink-700 font-bold shadow-lg shadow-pink-200" onClick={() => setIsReturnDialogOpen(true)}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Request Return
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Return/Exchange</DialogTitle>
            <DialogDescription>
              Please tell us why you want to return this order. You can upload photos if there's a defect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 my-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Reason for Return <span className="text-red-500">*</span></label>
              <Textarea 
                placeholder="Ex: Size doesn't fit, manufacturing defect, etc."
                className="min-h-[120px] focus:ring-pink-500"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold">Photos (Optional, max 5)</label>
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
                  <label className="w-20 h-20 border-2 border-dashed border-pink-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 transition-colors group">
                    <Camera className="w-6 h-6 text-pink-300 group-hover:text-pink-500" />
                    <span className="text-[10px] text-pink-400 mt-1">Add Photo</span>
                    <span className="text-[9px] text-pink-300 mt-0.5">Max 2MB</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Each photo must be under 2MB.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-pink-600 hover:bg-pink-700 font-bold"
              disabled={!returnReason.trim() || isSubmittingReturn}
              onClick={async () => {
                setIsSubmittingReturn(true);
                // Simulate API call
                await new Promise(r => setTimeout(r, 1500));
                toast({ title: "Return Requested", description: "Our team will review your request and get back within 24 hours." });
                setIsReturnDialogOpen(false);
                setIsSubmittingReturn(false);
              }}
            >
              {isSubmittingReturn ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails;
