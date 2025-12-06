import { useState, useEffect } from "react";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCustomersStore } from "@/stores/customersStore";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { customers, loading, fetchCustomers, updateCustomer } = useCustomersStore();

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      await updateCustomer(customerId, {
        status: customer.status === 'active' ? 'inactive' : 'active'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Customer Management</h2>
        <p className="text-muted-foreground">View and manage registered customers</p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Orders</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Total Spent</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm flex-shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-foreground block truncate">{customer.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden truncate block">{customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                        <div>
                          <p className="text-xs sm:text-sm text-foreground">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-foreground">{customer.totalOrders}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-foreground">₹{customer.totalSpent.toLocaleString()}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {customer.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                        {new Date(customer.lastOrderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 sm:h-8 sm:w-8" 
                          title="View History"
                          onClick={() => {
                            // In real app, this would show customer order history
                            alert(`Customer order history for ${customer.name} will be implemented with backend integration`);
                          }}
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 sm:h-8 sm:w-8 ${customer.status === "active" ? "text-red-500" : "text-green-500"}`}
                            onClick={() => toggleStatus(customer.id)}
                            title={customer.status === "active" ? "Block User" : "Unblock User"}
                          >
                            {customer.status === "active" ? <Ban className="w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
