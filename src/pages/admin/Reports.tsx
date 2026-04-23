import { useState, useEffect, useMemo } from "react";
import { Download, Calendar, TrendingUp, DollarSign, ShoppingCart, Users, BarChart2, FileText, Package, ArrowUpRight, FileSpreadsheet, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/adminStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { useProductsStore } from "@/stores/productsStore";
import { useCustomersStore } from "@/stores/customersStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const getDateRange = (range: string, customStart?: string, customEnd?: string): { start: Date; end: Date } => {
  const now = new Date();
  switch (range) {
    case 'last7days':   return { start: subDays(now, 7), end: now };
    case 'last30days':  return { start: subDays(now, 30), end: now };
    case 'last90days':  return { start: subDays(now, 90), end: now };
    case 'thisMonth':   return { start: startOfMonth(now), end: now };
    case 'lastMonth':   { const last = subMonths(now, 1); return { start: startOfMonth(last), end: endOfMonth(last) }; }
    case 'custom':
      if (customStart && customEnd) return { start: new Date(customStart), end: new Date(customEnd) };
      return { start: subDays(now, 30), end: now };
    default:            return { start: subDays(now, 30), end: now };
  }
};

const exportToExcel = async (data: any[], filename: string) => {
  if (!data || data.length === 0) { alert('No data to export.'); return; }
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

const exportToPDF = async (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) { alert('No data to export.'); return; }
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 26);
  const headers = Object.keys(data[0]);
  autoTable(doc, {
    head: [headers],
    body: data.map(row => headers.map(h => String(row[h] ?? ''))),
    startY: 32,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [219, 39, 119] },
  });
  doc.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

const STATUS_COLOR: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-red-100 text-red-800',
  Packed: 'bg-purple-100 text-purple-800',
};

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("last30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { stats, fetchDashboardStats } = useAdminStore();
  const { orders, fetchOrders } = useOrdersStore();
  const { products, fetchProducts } = useProductsStore();
  const { customers, fetchCustomers } = useCustomersStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchOrders(undefined, true);
    fetchCustomers();
    fetchProducts();
  }, []);

  const { start, end } = useMemo(() => getDateRange(dateRange, startDate, endDate), [dateRange, startDate, endDate]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    try {
      return isWithinInterval(parseISO(o.orderDate), { start, end });
    } catch { return false; }
  }), [orders, start, end]);

  const periodRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const periodOrders = filteredOrders.length;
  const avgOrderValue = periodOrders > 0 ? periodRevenue / periodOrders : 0;

  // Build daily revenue chart data from filtered orders
  const revenueChartData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; orders: number }> = {};
    filteredOrders.forEach(o => {
      try {
        const day = format(parseISO(o.orderDate), 'dd MMM');
        if (!map[day]) map[day] = { name: day, revenue: 0, orders: 0 };
        map[day].revenue += o.total;
        map[day].orders += 1;
      } catch {}
    });
    return Object.values(map);
  }, [filteredOrders]);

  // Prepare export data per report type
  const getExportData = () => {
    switch (reportType) {
      case 'sales':
        return revenueChartData.map(r => ({ Date: r.name, Revenue: r.revenue, Orders: r.orders }));
      case 'orders':
        return filteredOrders.map(o => ({
          OrderID: o.orderId, Customer: o.customerInfo.name, Email: o.customerInfo.email,
          Total: o.total, Status: o.status, PaymentMethod: o.paymentMethod, Date: o.orderDate
        }));
      case 'products':
        return (stats?.topProducts || []).map(p => ({ Product: p.name, UnitsSold: p.sold }));
      case 'customers':
        return customers.map(c => ({
          Name: c.name, Email: c.email, Phone: c.phone,
          TotalOrders: c.totalOrders, TotalSpent: c.totalSpent, Status: c.status
        }));
      case 'inventory':
        return products.map(p => ({
          Name: (p as any).name, Category: (p as any).category,
          Price: (p as any).price, InStock: (p as any).inStock ? 'Yes' : 'No'
        }));
      default:
        return [];
    }
  };

  const summaryCards = [
    { title: "Period Revenue", value: formatCurrency(periodRevenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-50", change: `${periodOrders} orders` },
    { title: "Period Orders", value: periodOrders.toString(), icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", change: filteredOrders.filter(o => o.status === 'Delivered').length + ' delivered' },
    { title: "Avg Order Value", value: formatCurrency(avgOrderValue), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", change: 'per order' },
    { title: "Total Customers", value: (stats?.totalCustomers || customers.length).toString(), icon: Users, color: "text-orange-600", bg: "bg-orange-50", change: 'all time' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {format(start, 'MMM dd, yyyy')} — {format(end, 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => exportToExcel(getExportData(), reportType + '-report')}
            variant="outline"
            className="gap-2 border-green-600 text-green-700 hover:bg-green-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            onClick={() => exportToPDF(getExportData(), reportType + '-report', `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report — Indhumathi Garments`)}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(s => (
          <Card key={s.title} className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />{s.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Report Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-semibold">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">📈 Sales Report</SelectItem>
                  <SelectItem value="orders">📦 Orders Report</SelectItem>
                  <SelectItem value="products">🏷️ Top Products</SelectItem>
                  <SelectItem value="customers">👥 Customers Report</SelectItem>
                  <SelectItem value="inventory">📋 Inventory Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-sm font-semibold">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-3 md:col-span-1">
                <div>
                  <Label className="mb-2 block text-xs font-semibold">From</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10" />
                </div>
                <div>
                  <Label className="mb-2 block text-xs font-semibold">To</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart – only shown for 'sales' */}
      {reportType === 'sales' && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" /> Revenue Over Time</CardTitle>
            <CardDescription>{filteredOrders.length} orders in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(340 70% 55%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(340 70% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(340 70% 55%)" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Calendar className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No orders in this date range</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Products Bar Chart – only shown for 'products' */}
      {reportType === 'products' && stats?.topProducts && stats.topProducts.length > 0 && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="hsl(340 70% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Data Table Preview */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {reportType === 'sales' ? 'Daily Revenue' :
               reportType === 'orders' ? 'Orders' :
               reportType === 'products' ? 'Top Products' :
               reportType === 'customers' ? 'Customers' : 'Inventory'}
            </CardTitle>
            <CardDescription>{getExportData().length} records</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            {/* SALES TABLE */}
            {reportType === 'sales' && (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-right p-3 font-semibold">Revenue</th>
                    <th className="text-right p-3 font-semibold">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueChartData.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-10 text-muted-foreground">No data for this period</td></tr>
                  ) : revenueChartData.map((r, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3 text-right font-bold text-green-600">{formatCurrency(r.revenue)}</td>
                      <td className="p-3 text-right">{r.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ORDERS TABLE */}
            {reportType === 'orders' && (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3 font-semibold">Order ID</th>
                    <th className="text-left p-3 font-semibold">Customer</th>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-right p-3 font-semibold">Total</th>
                    <th className="text-left p-3 font-semibold">Payment</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No orders in this period</td></tr>
                  ) : filteredOrders.slice().sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(o => (
                    <tr key={o.orderId} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs font-bold">{o.orderId}</td>
                      <td className="p-3">
                        <div className="font-medium">{o.customerInfo.name}</div>
                        <div className="text-xs text-muted-foreground">{o.customerInfo.email}</div>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{(() => { try { return format(parseISO(o.orderDate), 'dd MMM yyyy'); } catch { return o.orderDate; } })()}</td>
                      <td className="p-3 text-right font-bold">{formatCurrency(o.total)}</td>
                      <td className="p-3 capitalize text-muted-foreground">{o.paymentMethod}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[o.status] || 'bg-muted text-muted-foreground'}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TOP PRODUCTS TABLE */}
            {reportType === 'products' && (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3 font-semibold">#</th>
                    <th className="text-left p-3 font-semibold">Product Name</th>
                    <th className="text-right p-3 font-semibold">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.topProducts || []).length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-10 text-muted-foreground">No product sales data yet</td></tr>
                  ) : (stats?.topProducts || []).map((p, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-muted-foreground font-bold">#{i + 1}</td>
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-right font-bold text-primary">{p.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* CUSTOMERS TABLE */}
            {reportType === 'customers' && (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3 font-semibold">Customer</th>
                    <th className="text-left p-3 font-semibold">Phone</th>
                    <th className="text-right p-3 font-semibold">Orders</th>
                    <th className="text-right p-3 font-semibold">Total Spent</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No customers</td></tr>
                  ) : customers.slice().sort((a, b) => b.totalSpent - a.totalSpent).map(c => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.phone || '—'}</td>
                      <td className="p-3 text-right font-bold">{c.totalOrders}</td>
                      <td className="p-3 text-right font-bold text-green-600">{formatCurrency(c.totalSpent)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* INVENTORY TABLE */}
            {reportType === 'inventory' && (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3 font-semibold">Product</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-right p-3 font-semibold">Price</th>
                    <th className="text-center p-3 font-semibold">In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No products</td></tr>
                  ) : products.map((p: any) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-muted-foreground capitalize">{p.category}</td>
                      <td className="p-3 text-right font-bold">{formatCurrency(p.price)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
