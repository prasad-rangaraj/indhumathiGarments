import { useEffect } from 'react';
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, Eye, Mail, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAdminStore } from '@/stores/adminStore';
import { useProductsStore } from '@/stores/productsStore';
import { useOrdersStore } from '@/stores/ordersStore';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// Helper to format date
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Delivered": return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" };
    case "Shipped": return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
    case "Packed": return { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" };
    case "Pending": return { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" };
    default: return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  }
};

const Dashboard = () => {
  const { stats, loading: statsLoading, fetchDashboardStats } = useAdminStore();
  const { products, fetchProducts, loading: productsLoading } = useProductsStore();
  const { orders, fetchOrders, loading: ordersLoading } = useOrdersStore();

  useEffect(() => {
    fetchDashboardStats();
    if (products.length === 0) fetchProducts();
    fetchOrders(undefined); // Fetch all orders for admin
  }, [fetchDashboardStats, fetchProducts, fetchOrders, products.length]);

  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order.orderId,
    customer: order.customerName || order.customerInfo?.name || 'Guest',
    amount: formatCurrency(order.total),
    status: order.status,
    date: formatDate(order.orderDate),
  }));

  // Calculate low stock products
  const lowStockCount = products.filter(p => p.stock < 10).length;

  // Use stats from backend, show loading if not available
  if (statsLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueData: [],
    categoryData: [],
  };

  const categoryColors = ["#ec4899", "#a855f7", "#6366f1", "#22c55e", "#f97316"];
  const categoryData = dashboardStats.categoryData.map((item, index) => ({
    ...item,
    color: categoryColors[index % categoryColors.length],
  }));

  const statsCards = [
    { title: "Total Products", value: dashboardStats.totalProducts.toString(), icon: Package, color: "text-primary", bgColor: "bg-primary/10", trend: "", trendUp: true },
    { title: "Total Orders", value: dashboardStats.totalOrders.toString(), icon: ShoppingCart, color: "text-green-600", bgColor: "bg-green-100", trend: "", trendUp: true },
    { title: "Total Customers", value: dashboardStats.totalCustomers.toString(), icon: Users, color: "text-blue-600", bgColor: "bg-blue-100", trend: "", trendUp: true },
    { title: "Low Stock Alerts", value: lowStockCount.toString(), icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-100", trend: "", trendUp: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Last updated:</span>
          <span className="font-medium text-foreground">{new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border/50 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.trend} from last week
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue Overview
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-muted-foreground">Orders</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[240px] md:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardStats.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] sm:h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent orders</div>
              ) : (
                recentOrders.map((order) => {
                  const statusStyle = getStatusStyles(order.status);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.id} • {order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-foreground">{order.amount}</span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span className={`text-xs font-medium ${statusStyle.text}`}>{order.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-100/50 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Revenue Today</span>
                </div>
                  <span className="text-xl font-bold text-primary">{formatCurrency(dashboardStats.totalRevenue)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-foreground">Visitors</span>
              </div>
              <span className="text-xl font-bold text-primary">{formatCurrency(dashboardStats.totalRevenue)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-green-500" />
                <span className="text-sm text-foreground">Orders</span>
              </div>
              <span className="font-semibold text-foreground">{dashboardStats.totalOrders}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-foreground">Customers</span>
              </div>
              <span className="font-semibold text-foreground">{dashboardStats.totalCustomers}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-foreground">Products</span>
              </div>
              <span className="font-semibold text-foreground">{dashboardStats.totalProducts}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;