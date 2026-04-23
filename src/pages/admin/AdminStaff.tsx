import { useState, useEffect } from "react";
import { Search, ShieldAlert, Shield, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAdminStore } from "@/stores/adminStore";
import { useCustomersStore } from "@/stores/customersStore";
import { useAuthStore } from "@/stores/authStore";

const AdminStaff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchStaff } = useAdminStore();
  const { updateCustomer, changeUserRole } = useCustomersStore();
  const { user: currentUser } = useAuthStore();
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadStaff = async () => {
    setLoading(true);
    const data = await fetchStaff();
    setStaffList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = async (staffId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateCustomer(staffId, { status: newStatus });
      setStaffList(prev => prev.map(s => s.id === staffId ? { ...s, status: newStatus } : s));
      showMessage(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`, 'success');
    } catch (e: any) {
      showMessage(e?.message || 'Failed to update status', 'error');
    }
  };

  const demoteToCustomer = async (staffId: string) => {
    if (confirm("Are you sure you want to demote this admin to a regular customer?")) {
      try {
        await changeUserRole(staffId, 'customer');
        setStaffList(prev => prev.filter(s => s.id !== staffId));
        showMessage(`User demoted to Customer`, 'success');
      } catch (e: any) {
        showMessage(e?.message || 'Failed to change role', 'error');
      }
    }
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
        <div>
          <ShieldAlert className="w-10 h-10 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p>Only Super Administrators can manage staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Staff</h2>
          <p className="text-muted-foreground">Manage admin accounts and their access</p>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-3 rounded-lg text-sm font-medium border ${
          actionMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {actionMessage.type === 'success' ? '✅' : '❌'} {actionMessage.text}
        </div>
      )}

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name or email..."
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Staff Member</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Role</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">{staff.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-foreground">{staff.email}</p>
                        <p className="text-xs text-muted-foreground">{staff.phone || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          staff.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {staff.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          staff.role === 'super_admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {staff.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {staff.role !== 'super_admin' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={staff.status === 'active' ? 'text-red-600' : 'text-green-600'}
                              onClick={() => toggleStatus(staff.id, staff.status)}
                            >
                              {staff.status === 'active' ? <Ban className="w-4 h-4 mr-1"/> : <CheckCircle className="w-4 h-4 mr-1"/>}
                              {staff.status === 'active' ? 'Block' : 'Unblock'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200"
                              onClick={() => demoteToCustomer(staff.id)}
                            >
                              <ShieldAlert className="w-4 h-4 mr-1" /> Demote
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">No staff members found.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">Loading staff...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStaff;
