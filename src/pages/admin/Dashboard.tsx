import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, Star, ArrowUpRight, ArrowDownRight, Calendar, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAdminStore } from '@/stores/adminStore';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const getStatusStyles = (status: string) => {
  switch (status) {
    case "Delivered": return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" };
    case "Shipped": return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
    case "Packed": return { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" };
    case "Pending": return { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" };
    default: return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
  }
};

type Range = 'today' | 'week' | 'month' | 'all';

const Dashboard = () => {
  const { stats, loading: statsLoading, fetchDashboardStats } = useAdminStore();
  const [range, setRange] = useState<Range>('month');

  useEffect(() => {
    fetchDashboardStats(range);
  }, [range]);

  if (statsLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const d = stats || {
    totalRevenue: 0, todayRevenue: 0, todayOrders: 0,
    totalOrders: 0, totalCustomers: 0, totalProducts: 0,
    lowStockCount: 0, revenueData: [], categoryData: [], topProducts: [],
  };

  const categoryColors = ["#ec4899", "#a855f7", "#6366f1", "#22c55e", "#f97316"];
  const categoryData = (d.categoryData || []).map((item: any, i: number) => ({
    ...item, color: categoryColors[i % categoryColors.length],
  }));

  const statsCards = [
    { title: "Today's Revenue", value: formatCurrency(d.todayRevenue || 0), icon: IndianRupee, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Today's Orders", value: (d.todayOrders || 0).toString(), icon: ShoppingCart, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Total Customers", value: d.totalCustomers.toString(), icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Low Stock Alerts", value: (d.lowStockCount || 0).toString(), icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-100" },
  ];

  const rangeButtons: { label: string; value: Range }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Store overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        {/* Date Range Filter */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Calendar className="w-4 h-4 text-muted-foreground ml-1" />
          {rangeButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setRange(btn.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                range === btn.value ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {btn.label}
            </button>
          ))}
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
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
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
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Revenue</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />Orders</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
              {(d.revenueData || []).length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
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
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {categoryData.slice(0, 4).map((item: any) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Stats */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Overall Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Total Revenue (All Time)', value: formatCurrency(d.totalRevenue), color: 'text-primary' },
              { label: 'Total Orders', value: d.totalOrders.toString(), color: 'text-foreground' },
              { label: 'Total Customers', value: d.totalCustomers.toString(), color: 'text-foreground' },
              { label: 'Active Products', value: d.totalProducts.toString(), color: 'text-foreground' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(d.topProducts || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No product data yet</div>
            ) : (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.topProducts} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                    <Bar dataKey="sold" fill="#ec4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-100/50 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Today's Revenue</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(d.todayRevenue || 0)}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <p className="text-xs text-muted-foreground mb-1">Orders Today</p>
              <p className="text-xl font-bold text-green-600">{d.todayOrders || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <p className="text-xs text-muted-foreground mb-1">Low Stock Products</p>
              <p className="text-xl font-bold text-orange-600">{d.lowStockCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Orders Section */}
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All <ArrowUpRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left font-medium py-3 px-2">Order ID</th>
                  <th className="text-left font-medium py-3 px-2">Customer</th>
                  <th className="text-left font-medium py-3 px-2 hidden sm:table-cell">Date</th>
                  <th className="text-left font-medium py-3 px-2">Amount</th>
                  <th className="text-left font-medium py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Normally we'd fetch this separately or use a slice of all orders. 
                    Since adminStore doesn't have orders yet, we'll assume it's added or use a dummy fetch */}
                {/* Integration Note: Need to verify if fetchOrders is available in adminStore */}
                {!d.recentOrders || d.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No recent orders to display.
                    </td>
                  </tr>
                ) : (
                  d.recentOrders.map((order: any) => {
                    const status = getStatusStyles(order.status);
                    return (
                      <tr key={order.orderId} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 font-medium">
                          <Link to={`/admin/orders/${order.orderId}`} className="hover:text-primary transition-colors">
                            {order.orderId}
                          </Link>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-foreground">{order.customerInfo?.name || 'Guest'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">{order.customerInfo?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-3 px-2 font-bold text-foreground">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;