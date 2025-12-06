import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useOrdersStore, Order } from '@/stores/ordersStore';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders, loading, fetchOrders, getOrderById } = useOrdersStore();

  useEffect(() => {
    if (orders.length === 0) {
      fetchOrders();
    }
  }, [orders.length, fetchOrders]);

  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
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
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck };
      case 'Packed':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: Package };
      case 'Pending':
        return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Package };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Package };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <Link
            to="/orders"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Back to Orders
          </Link>

          <div className="card-elegant p-4 sm:p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Order {order.orderId}
                </h1>
                <p className="text-muted-foreground">Placed on {formatDate(order.orderDate)}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} flex items-center gap-2 w-fit`}>
                <StatusIcon className="w-4 h-4" />
                {order.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.customerInfo.name}</p>
                  <p>{order.customerInfo.address}</p>
                  <p>{order.customerInfo.city} - {order.customerInfo.pincode}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-4 h-4" />
                    <p>{order.customerInfo.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <p>{order.customerInfo.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {order.paymentMethod === 'upi' ? 'UPI' : 
                       order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       'Credit/Debit Card'}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking Number:</span>
                      <span className="font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 bg-accent/30 rounded-lg">
                    <div className="w-16 h-16 rounded bg-accent/70 border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                      No Image
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="flex justify-center">
              <Link
                to={`/track/${order.trackingNumber}`}
                className="btn-primary flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Track Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
