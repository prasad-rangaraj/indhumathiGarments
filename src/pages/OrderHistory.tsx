import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Truck, CheckCircle } from 'lucide-react';
import { useOrdersStore } from '@/stores/ordersStore';
import { resolveItemImage } from '@/lib/utils';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

const OrderHistory = () => {
  const { orders, loading, fetchOrders } = useOrdersStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Package };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (orders.length === 0 && !loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
          <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>
        <div className="flex items-center justify-center px-4 min-h-screen">
          <div className="text-center animate-fade-in">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">No orders yet</h2>
            <p className="text-muted-foreground mb-8">Start shopping to see your orders here!</p>
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 pointer-events-none">
        <img src={bgCotton1} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      <div className="py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className=" sm:mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Orders
            </h1>
            {loading && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.orderId} className="card-elegant overflow-hidden group">
                  {/* Clickable block — top section goes to track page */}
                  <Link
                    to={`/track/${order.orderId}`}
                    className="block p-4 sm:p-6 border-b border-border/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{order.orderId}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatDate(order.orderDate)}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">₹{order.total}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-10 h-10 rounded bg-accent/70 flex items-center justify-center text-xs text-muted-foreground overflow-hidden">
                            {resolveItemImage(item) ? (
                              <img
                                src={resolveItemImage(item)?.startsWith('http') ? resolveItemImage(item) as string : `${import.meta.env.VITE_API_URL.replace('/api', '')}${resolveItemImage(item)}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              "IMG"
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-xs">{item.name}</p>
                            <div className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-1 mt-0.5">
                              <span>Size: {item.selectedSize || item.size}</span>
                              {(item.selectedColor || item.color) && (
                                <span className="flex items-center gap-0.5 ml-1">
                                  Color: <span className="w-2.5 h-2.5 rounded-full border border-border shadow-sm inline-block" style={{ backgroundColor: item.selectedColor || item.color }} title={item.selectedColor || item.color} />
                                </span>
                              )}
                              <span className="ml-1">× {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground self-center">
                          +{order.items.length - 3} more
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Action buttons (bottom part) */}
                  <div className="p-4 sm:p-6 py-4 flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/order/${order.orderId}`}
                      className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 flex-1"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </Link>
                    <Link
                      to={`/track/${order.orderId}`}
                      className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 flex-1"
                    >
                      <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                      Track Order
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
