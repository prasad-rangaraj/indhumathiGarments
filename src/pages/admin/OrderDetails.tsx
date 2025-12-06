import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Download, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ordersData = [
  { id: "ORD-001", customer: "Priya Sharma", email: "priya@email.com", phone: "+91 98765 43210", amount: 1299, status: "Delivered", date: "2025-12-02", items: 2, trackingNumber: "TRK001", address: "123 Main St, Coimbatore, 641001" },
  { id: "ORD-002", customer: "Anita Reddy", email: "anita@email.com", phone: "+91 87654 32109", amount: 899, status: "Shipped", date: "2025-12-02", items: 1, trackingNumber: "TRK002", address: "456 Park Ave, Chennai, 600001" },
  { id: "ORD-003", customer: "Meera Patel", email: "meera@email.com", phone: "+91 76543 21098", amount: 2499, status: "Pending", date: "2025-12-01", items: 3, trackingNumber: null, address: "789 Market Rd, Bangalore, 560001" },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Delivered": 
      return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle };
    case "Shipped": 
      return { bg: "bg-blue-100", text: "text-blue-700", icon: Truck };
    case "Packed": 
      return { bg: "bg-purple-100", text: "text-purple-700", icon: Package };
    case "Pending": 
      return { bg: "bg-orange-100", text: "text-orange-700", icon: Clock };
    default: 
      return { bg: "bg-gray-100", text: "text-gray-700", icon: Package };
  }
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const foundOrder = ordersData.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
      setStatus(foundOrder.status);
    }
  }, [orderId]);

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

  const handleStatusUpdate = (newStatus: string) => {
    setStatus(newStatus);
    // In real app, this would update via API
  };

  const handleDownloadInvoice = () => {
    // In real app, this would generate and download invoice
    alert('Invoice download functionality will be implemented with backend integration');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/orders')} size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
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
                  <Select value={status} onValueChange={handleStatusUpdate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Packed">Packed</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
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
                {Array.from({ length: order.items }).map((_, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-16 h-16 rounded bg-accent/70 flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Product {idx + 1}</p>
                      <p className="text-sm text-muted-foreground">Size: M × 1</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{Math.round(order.amount / order.items)}</p>
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
                <p className="font-medium text-foreground">{order.customer}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-foreground">{order.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-foreground">{order.phone}</p>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-border">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <p className="text-sm text-foreground">{order.address}</p>
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
                <span className="font-medium">₹{order.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₹{order.amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleDownloadInvoice} className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
