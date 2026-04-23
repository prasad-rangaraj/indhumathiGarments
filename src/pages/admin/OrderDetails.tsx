import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Download, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { orders, fetchOrders, updateOrderStatus, getOrderById, updateOrderDelay } = useOrdersStore();
  const [updating, setUpdating] = useState(false);
  const [delayUpdating, setDelayUpdating] = useState(false);
  const [delayDate, setDelayDate] = useState<string>('');
  const [delayReasonText, setDelayReasonText] = useState<string>('');

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders();
    }
  }, [orders.length, fetchOrders]);

  const order = orderId ? getOrderById(orderId) : undefined;
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
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 rounded bg-accent/70 flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name || (item.product && item.product.name) || 'Product'}</p>
                      <p className="text-sm text-muted-foreground">Size: {item.selectedSize || item.size} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
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
