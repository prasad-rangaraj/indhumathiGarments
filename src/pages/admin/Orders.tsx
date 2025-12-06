import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Download, RotateCcw, Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrdersStore, Order } from "@/stores/ordersStore";

const statusOptions = ["Pending", "Packed", "Shipped", "Delivered", "Refund Requested"];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Delivered": 
      return { 
        bg: "bg-green-100", 
        text: "text-green-700", 
        border: "border-green-200",
        icon: CheckCircle,
        dot: "bg-green-500"
      };
    case "Shipped": 
      return { 
        bg: "bg-blue-100", 
        text: "text-blue-700", 
        border: "border-blue-200",
        icon: Truck,
        dot: "bg-blue-500"
      };
    case "Packed": 
      return { 
        bg: "bg-purple-100", 
        text: "text-purple-700", 
        border: "border-purple-200",
        icon: Package,
        dot: "bg-purple-500"
      };
    case "Pending": 
      return { 
        bg: "bg-orange-100", 
        text: "text-orange-700", 
        border: "border-orange-200",
        icon: Clock,
        dot: "bg-orange-500"
      };
    case "Refund Requested": 
      return { 
        bg: "bg-red-100", 
        text: "text-red-700", 
        border: "border-red-200",
        icon: XCircle,
        dot: "bg-red-500"
      };
    default: 
      return { 
        bg: "bg-gray-100", 
        text: "text-gray-700", 
        border: "border-gray-200",
        icon: Package,
        dot: "bg-gray-500"
      };
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders(undefined); // Pass undefined to fetch all orders (admin view)
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
        <p className="text-muted-foreground">View and manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shipped</p>
                <p className="text-xl font-bold text-foreground">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-xl font-bold text-foreground">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={order.orderId} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-foreground">{order.orderId}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">{order.customerInfo.name}</p>
                            <p className="text-xs text-muted-foreground hidden sm:block">{order.customerInfo.email}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{order.items.length} items</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-foreground hidden sm:table-cell">{order.items.length}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-foreground">₹{order.total}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleUpdateStatus(order.orderId, value as Order['status'])}
                          >
                            <SelectTrigger className={`w-[140px] sm:w-[160px] h-8 sm:h-9 border ${statusConfig.border} ${statusConfig.bg}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                <span className={`text-xs font-medium ${statusConfig.text}`}>{order.status}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => {
                                const config = getStatusConfig(status);
                                return (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                                      <span>{status}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8" 
                            title="View Details"
                            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" title="Download Invoice">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            {order.status === "Refund Requested" && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500" title="Process Refund">
                                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;