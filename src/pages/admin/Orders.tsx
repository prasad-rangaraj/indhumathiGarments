import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Download, RotateCcw, Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag, Printer, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore } from "@/stores/adminStore";
import { useOrdersStore, Order } from "@/stores/ordersStore";

const statusOptions = ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Delivered": return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: CheckCircle, dot: "bg-green-500" };
    case "Shipped": return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: Truck, dot: "bg-blue-500" };
    case "Packed": return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: Package, dot: "bg-purple-500" };
    case "Pending": return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", icon: Clock, dot: "bg-orange-500" };
    case "Cancelled": return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: XCircle, dot: "bg-red-500" };
    default: return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: Package, dot: "bg-gray-500" };
  }
};

// CSV Export helper
const exportOrdersCSV = (orders: any[]) => {
  const headers = ["Order ID", "Customer", "Email", "Items", "Total (₹)", "Status", "Date"];
  const rows = orders.map(o => [
    o.orderId,
    o.customerInfo?.name || '',
    o.customerInfo?.email || '',
    o.items.length,
    Number(o.total).toFixed(2),
    o.status,
    new Date(o.orderDate).toLocaleDateString('en-IN'),
  ]);
  const csv = [headers, ...rows].map(r => r.map(String).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// Print invoice helper
const printInvoice = (order: any) => {
  const content = `
    <html><head><title>Invoice ${order.orderId}</title>
    <style>body{font-family:sans-serif;padding:20px;max-width:600px;margin:auto}
    h1{color:#333}table{width:100%;border-collapse:collapse}
    th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd}
    .total{font-weight:bold;font-size:1.1em}.badge{padding:4px 10px;border-radius:12px;font-size:12px}
    </style></head><body>
    <h1>Invoice</h1>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <hr/>
    <h3>Customer</h3>
    <p>${order.customerInfo?.name || 'N/A'}<br/>${order.customerInfo?.email || ''}<br/>${order.customerInfo?.phone || ''}</p>
    <hr/>
    <h3>Items</h3>
    <table><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
    ${order.items.map((item: any) => `<tr>
      <td>${item.product?.name || item.name || 'Item'}</td>
      <td>${item.quantity}</td>
      <td>₹${Number(item.price).toFixed(2)}</td>
      <td>₹${(Number(item.price) * item.quantity).toFixed(2)}</td>
    </tr>`).join('')}
    </table>
    <hr/>
    <p class="total">Total: ₹${Number(order.total).toFixed(2)}</p>
    <br/><p style="color:#888;font-size:12px">Indhumathi Garments — Thank you for your order!</p>
    </body></html>
  `;
  const w = window.open('', '_blank');
  if (w) { w.document.write(content); w.document.close(); w.print(); }
};

const Orders = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders } = useAdminStore();
  const { updateOrderStatus } = useOrdersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    fetchOrders();
    setLastRefreshed(new Date());
  }, [fetchOrders]);

  const handleRefresh = () => {
    fetchOrders();
    setLastRefreshed(new Date());
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    shipped: orders.filter(o => o.status === "Shipped").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.orderId)));
    }
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkUpdating(true);
    const promises = Array.from(selectedIds).map(id => updateOrderStatus(id, bulkStatus as Order['status']));
    await Promise.all(promises);
    setSelectedIds(new Set());
    setBulkStatus("");
    setBulkUpdating(false);
  };

  const allSelected = filteredOrders.length > 0 && selectedIds.size === filteredOrders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Last updated: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => exportOrdersCSV(filteredOrders)}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Set status..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={applyBulkStatus} disabled={!bulkStatus || bulkUpdating} className="h-8">
                {bulkUpdating ? 'Updating...' : 'Apply'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="h-8 ml-auto">Clear</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 px-4 w-10">
                      <button onClick={toggleSelectAll} className="text-muted-foreground">
                        {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && !loading ? (
                    <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No orders found.</td></tr>
                  ) : filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const isSelected = selectedIds.has(order.orderId);
                    return (
                      <tr key={order.orderId} className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                        <td className="py-3 px-4">
                          <button onClick={() => toggleSelect(order.orderId)} className="text-muted-foreground">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-foreground">{order.orderId}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-foreground">{order.customerInfo?.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{order.customerInfo?.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customerInfo?.email}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground hidden sm:table-cell">{order.items.length}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">₹{Number(order.total).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.orderId, v as Order['status'])}>
                            <SelectTrigger className={`w-[140px] h-8 border ${statusConfig.border} ${statusConfig.bg}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                <span className={`text-xs font-medium ${statusConfig.text}`}>{order.status}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s => {
                                const c = getStatusConfig(s);
                                return (
                                  <SelectItem key={s} value={s}>
                                    <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${c.dot}`} /><span>{s}</span></div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground hidden md:table-cell">
                          {new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => navigate(`/admin/orders/${order.orderId}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Print Invoice" onClick={() => printInvoice(order)}>
                              <Printer className="w-4 h-4" />
                            </Button>
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
