import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Clock } from 'lucide-react';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

const OrderTracking = () => {
  const { trackingNumber } = useParams();
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    // Generate tracking events based on tracking number
    if (trackingNumber) {
      const events: TrackingEvent[] = [
        {
          status: 'Delivered',
          location: 'Coimbatore, Tamil Nadu',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Your order has been delivered successfully'
        },
        {
          status: 'Out for Delivery',
          location: 'Coimbatore Hub',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Your order is out for delivery'
        },
        {
          status: 'In Transit',
          location: 'Chennai Hub',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Your order is in transit'
        },
        {
          status: 'Shipped',
          location: 'Tirupur Warehouse',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Your order has been shipped'
        },
        {
          status: 'Order Confirmed',
          location: 'Tirupur Warehouse',
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Your order has been confirmed'
        }
      ];
      setTrackingEvents(events);

      // Get order info from localStorage
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const order = orders.find((o: any) => o.trackingNumber === trackingNumber);
        if (order) setOrderInfo(order);
      }

      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        const order = JSON.parse(lastOrder);
        if (order.trackingNumber === trackingNumber) {
          setOrderInfo(order);
        }
      }
    }
  }, [trackingNumber]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string, index: number) => {
    if (index === 0) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <div className="w-3 h-3 rounded-full bg-primary" />;
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <Link
            to="/orders"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Back to Orders
          </Link>

          <div className="card-elegant p-4 sm:p-6 md:p-8 mb-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Track Your Order
              </h1>
              <p className="text-muted-foreground">Tracking Number: {trackingNumber}</p>
              {orderInfo && (
                <p className="text-sm text-muted-foreground mt-2">
                  Order {orderInfo.orderId} • ₹{orderInfo.total}
                </p>
              )}
            </div>

            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
              
              <div className="space-y-6">
                {trackingEvents.map((event, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                        {getStatusIcon(event.status, index)}
                      </div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.status}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {orderInfo && (
            <div className="card-elegant p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Address</h2>
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">{orderInfo.customerInfo.name}</p>
                <p>{orderInfo.customerInfo.address}</p>
                <p>{orderInfo.customerInfo.city} - {orderInfo.customerInfo.pincode}</p>
                <p className="mt-2">{orderInfo.customerInfo.phone}</p>
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/orders" className="btn-secondary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
