import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Download, MapPin, Phone, Mail, ShoppingBag } from 'lucide-react';
import { resolveItemImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAdminStore } from '@/stores/adminStore';
import { useOrdersStore, Order } from '@/stores/ordersStore';
import { useToast } from '@/hooks/use-toast';

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Delivered": 
      return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle };
    case "Shipped": 
      return { bg: "bg-blue-100", text: "text-blue-700", icon: Truck };
    case "Packed": 
      return { bg: "bg-purple-100", text: "text-purple-700", icon: Package };
    case "Cancelled":
      return { bg: "bg-red-100", text: "text-red-700", icon: Clock };
    case "Pending": 
      return { bg: "bg-orange-100", text: "text-orange-700", icon: Clock };
    default: 
      return { bg: "bg-gray-100", text: "text-gray-700", icon: Package };
  }
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { orders, fetchOrders } = useAdminStore();
  const { updateOrderStatus, getOrderById, updateOrderDelay } = useOrdersStore();
  const [updating, setUpdating] = useState(false);
  const [delayUpdating, setDelayUpdating] = useState(false);
  const [delayDate, setDelayDate] = useState<string>('');
  const [delayReasonText, setDelayReasonText] = useState<string>('');

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders();
    }
  }, [orders.length, fetchOrders]);

  const order = orderId ? orders.find(o => o.orderId === orderId) : undefined;
  const status = order?.status || 'Pending';

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Link to="/admin/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!orderId) return;
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus as Order['status']);
      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update order status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (order) {
      if (order.delayedDeliveryDate) {
        setDelayDate(new Date(order.delayedDeliveryDate).toISOString().split('T')[0]);
      }
      if (order.delayReason) {
        setDelayReasonText(order.delayReason);
      }
    }
  }, [order?.delayedDeliveryDate, order?.delayReason]);

  const handleDelayUpdate = async () => {
    if (!orderId) return;
    setDelayUpdating(true);
    try {
      await updateOrderDelay(orderId, {
        delayedDeliveryDate: delayDate || null,
        delayReason: delayReasonText || null
      });
      toast({
        title: "Delay updated",
        description: "Delivery delay details saved successfully"
      });
    } catch (error) {
       toast({
        title: "Update failed",
        description: "Could not update delivery delay",
        variant: "destructive"
      });
    } finally {
      setDelayUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    // Basic print functionality
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/orders')} size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
          <p className="text-muted-foreground">Order ID: {order.orderId}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Status</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} flex items-center gap-2`}>
                  <StatusIcon className="w-4 h-4" />
                  {status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Update Status</label>
                  <Select value={status} onValueChange={handleStatusUpdate} disabled={updating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Packed">Packed</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {order.status === 'Cancelled' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-sm">
                    <p className="font-semibold text-red-700">Cancellation Reason</p>
                    <p className="text-red-600 mt-1">{order.cancelReason || 'No reason provided.'}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delay Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Delay Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Delayed Delivery Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={delayDate}
                      onChange={(e) => setDelayDate(e.target.value)}
                      disabled={delayUpdating}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Delay Reason</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Due to heavy rain"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={delayReasonText}
                      onChange={(e) => setDelayReasonText(e.target.value)}
                      disabled={delayUpdating}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleDelayUpdate} disabled={delayUpdating || (!delayDate && !!delayReasonText)}>
                    {delayUpdating ? 'Saving...' : 'Save Delay'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <span className="text-sm text-muted-foreground font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item: any, idx) => {
                  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
                  const toUrl = (src: string) => {
                    if (!src) return '';
                    if (src.startsWith('http')) return src;
                    const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
                    return `${prefix}${src.startsWith('/') ? src : `/${src}`}`;
                  };
                  const imgSrc = resolveItemImage(item);
                  const colorName = item.selectedColor || item.color;
                  const unitPrice = item.price;
                  const subtotal = item.price * item.quantity;
                  
                  let thumbSrc = null;
                  let colorHex = '#000000';
                  if (colorName && item.colors && Array.isArray(item.colors)) {
                    const colorObj = item.colors.find((c: any) => c.name === colorName);
                    if (colorObj) {
                      thumbSrc = colorObj.primaryImage || colorObj.images?.[0] || null;
                      colorHex = colorObj.hex || '#000000';
                    }
                  }
                  const showColorThumbnails = item.product?.showColorThumbnails;

                  return (
                    <div key={idx} className="flex gap-4 p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-border bg-accent/30 flex-shrink-0 overflow-hidden">
                        {imgSrc ? (
                          <img
                            src={toUrl(imgSrc)}
                            alt={item.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 mb-2">
                          {item.name || (item.product?.name) || 'Product'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {/* Size badge */}
                          <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded font-medium">
                            Size: <strong>{item.selectedSize || item.size || '—'}</strong>
                          </span>
                          {/* Color / Style badge */}
                          {colorName && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium capitalize">
                              {showColorThumbnails && thumbSrc ? (
                                <img
                                  src={toUrl(thumbSrc)}
                                  alt={colorName}
                                  className="w-3.5 h-3.5 rounded-sm object-cover border border-primary/20"
                                />
                              ) : (
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-primary/20 shadow-sm"
                                  style={{ backgroundColor: colorHex }}
                                />
                              )}
                              <span>Style: <strong>{colorName}</strong></span>
                            </span>
                          )}
                          {/* Category */}
                          {item.category && (
                            <span className="inline-flex items-center text-xs bg-accent/60 text-muted-foreground px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Qty: <strong className="text-foreground">{item.quantity}</strong></span>
                          <span>Unit: <strong className="text-foreground">₹{unitPrice}</strong></span>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right flex-shrink-0 flex flex-col justify-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Subtotal</p>
                        <p className="font-bold text-foreground text-base sm:text-lg">₹{subtotal}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{order.customerInfo.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-foreground">{order.customerInfo.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-foreground">{order.customerInfo.phone}</p>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <p className="text-sm text-foreground">{order.customerInfo.address}, {order.customerInfo.city} - {order.customerInfo.pincode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{order.originalTotal || order.total}</span>
              </div>
              {order.discount && order.discount > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-green-600">-₹{order.discount}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleDownloadInvoice} className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
