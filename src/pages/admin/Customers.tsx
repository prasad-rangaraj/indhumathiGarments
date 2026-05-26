import { useState, useEffect } from "react";
import { Search, Eye, Ban, CheckCircle, ShieldAlert, Shield, Trash2, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCustomersStore, Customer } from "@/stores/customersStore";
import { useAuthStore } from "@/stores/authStore";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { customers, loading, fetchCustomers, updateCustomer, changeUserRole, deleteCustomer } = useCustomersStore();
  const { user: currentUser, refreshUser } = useAuthStore();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Always refresh role from DB on mount so super_admin sees the right buttons
    refreshUser();
    if (customers.length === 0) {
      fetchCustomers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const openModal = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setActionMessage(null);
    setOrdersLoading(true);
    try {
      const { adminAPI } = await import('@/lib/api');
      const allOrders: any[] = await adminAPI.getOrders();
      const orders = allOrders.filter((o: any) => o.userId === customer.id);
      setCustomerOrders(orders);
    } catch {
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setActionMessage(null);
  };

  const toggleStatus = async () => {
    if (!selectedCustomer) return;
    try {
      await updateCustomer(selectedCustomer.id, {
        status: selectedCustomer.status === 'active' ? 'inactive' : 'active'
      });
      const newStatus = selectedCustomer.status === 'active' ? 'inactive' : 'active';
      setSelectedCustomer(prev => prev ? { ...prev, status: newStatus } : null);
      showMessage(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`, 'success');
    } catch (e: any) {
      showMessage(e?.message || 'Failed to update status', 'error');
    }
  };

  const toggleRole = async () => {
    if (!selectedCustomer) return;
    if (selectedCustomer.role === 'super_admin') return;
    const newRole = selectedCustomer.role === 'admin' ? 'customer' : 'admin';
    try {
      await changeUserRole(selectedCustomer.id, newRole);
      setSelectedCustomer(prev => prev ? { ...prev, role: newRole } : null);
      showMessage(`User ${newRole === 'admin' ? 'promoted to Admin ✓' : 'demoted to Customer ✓'}`, 'success');
    } catch (e: any) {
      showMessage(e?.message || 'Failed to change role', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    if (selectedCustomer.role === 'super_admin') { showMessage('Cannot delete super admin.', 'error'); return; }
    if (confirm(`Permanently delete ${selectedCustomer.name}? This cannot be undone.`)) {
      try {
        await deleteCustomer(selectedCustomer.id);
        closeModal();
      } catch (e: any) {
        showMessage(e?.message || 'Failed to delete user', 'error');
      }
    }
  };

// CSV Export helper
const exportCustomersCSV = (customers: Customer[]) => {
  const headers = ["ID", "Name", "Email", "Phone", "Status", "Role", "Total Orders", "Total Spent (₹)"];
  const rows = customers.map(c => [
    c.id, c.name, c.email, c.phone || 'N/A', c.status, c.role, c.totalOrders, c.totalSpent
  ]);
  const csv = [headers, ...rows].map(r => r.map(String).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Management</h2>
          <p className="text-muted-foreground">Click the eye icon on any customer to manage them</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => exportCustomersCSV(filteredCustomers)}
        >
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Orders</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Spent</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground truncate">{customer.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">{customer.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-sm text-foreground">{customer.email}</p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{customer.totalOrders}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">₹{customer.totalSpent.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {customer.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          (customer.role || 'customer') === 'super_admin' ? "bg-purple-100 text-purple-700" :
                          (customer.role || 'customer') === 'admin' ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {(customer.role || 'customer').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary/80"
                          title="View & Manage Customer"
                          onClick={() => openModal(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">No customers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Management Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
            </div>

            {/* Feedback Banner */}
            {actionMessage && (
              <div className={`px-6 py-2 text-sm font-medium ${actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-red-50 text-red-700 border-b border-red-200'}`}>
                {actionMessage.type === 'success' ? '✅' : '❌'} {actionMessage.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {/* 🚫 Block / Unblock - All admins */}
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-2 ${selectedCustomer.status === 'active' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                  onClick={toggleStatus}
                >
                  {selectedCustomer.status === 'active'
                    ? <><Ban className="w-4 h-4" /> Block User</>
                    : <><CheckCircle className="w-4 h-4" /> Unblock User</>
                  }
                </Button>

                {/* 🛡️ Promote / Demote - Super Admin only */}
                {currentUser?.role === 'super_admin' && selectedCustomer.role !== 'super_admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={toggleRole}
                  >
                    {selectedCustomer.role === 'admin'
                      ? <><ShieldAlert className="w-4 h-4" /> Demote to Customer</>
                      : <><Shield className="w-4 h-4" /> Promote to Admin</>
                    }
                  </Button>
                )}

                {/* 🗑️ Delete - Super Admin only */}
                {currentUser?.role === 'super_admin' && selectedCustomer.role !== 'super_admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Customer
                  </Button>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Order History</p>
                <span className="ml-auto text-xs text-muted-foreground">{selectedCustomer.totalOrders} order(s) · ₹{selectedCustomer.totalSpent.toLocaleString()} spent</span>
              </div>
              {ordersLoading ? (
                <div className="text-center py-10 text-muted-foreground text-sm">Loading orders...</div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No orders placed yet.</div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order: any) => (
                    <div key={order.id} className="border border-border/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">#{order.orderId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{order.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="font-bold text-foreground">₹{Number(order.total).toLocaleString()}</span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                          {order.items.length} item(s): {order.items.slice(0, 2).map((i: any) => i.product?.name || 'Item').join(', ')}
                          {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
