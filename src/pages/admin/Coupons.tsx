import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminStore } from "@/stores/adminStore";
import { adminAPI } from "@/lib/api";

const Coupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { fetchCoupons } = useAdminStore();

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load coupons", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Coupon code ${code} copied to clipboard` });
  };

  const toggleActive = async (couponId: string) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) return;
      
      await adminAPI.updateCoupon(couponId, { isActive: !coupon.isActive });
      await loadCoupons();
      toast({ title: "Success", description: `Coupon ${coupon.isActive ? 'deactivated' : 'activated'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update coupon", variant: "destructive" });
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      await adminAPI.deleteCoupon(couponId);
      await loadCoupons();
      toast({ title: "Success", description: "Coupon deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code') as string,
      discount: parseFloat(formData.get('discount') as string),
      minAmount: formData.get('minAmount') ? parseFloat(formData.get('minAmount') as string) : null,
      maxDiscount: formData.get('maxDiscount') ? parseFloat(formData.get('maxDiscount') as string) : null,
      validFrom: new Date(formData.get('validFrom') as string).toISOString(),
      validUntil: new Date(formData.get('validUntil') as string).toISOString(),
      isActive: true,
      usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : null,
    };

    try {
      await adminAPI.createCoupon(data);
      await loadCoupons();
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      toast({ title: "Success", description: "Coupon created successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create coupon", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Coupons & Discounts</h2>
          <p className="text-muted-foreground">Create and manage promotional codes</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Create New Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input name="code" placeholder="e.g., SAVE20" className="uppercase" required />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input name="discount" type="number" placeholder="e.g., 20" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Min. Order Value (₹)</Label>
                <Input name="minAmount" type="number" placeholder="e.g., 999" />
              </div>
              <div className="space-y-2">
                <Label>Max. Discount (₹)</Label>
                <Input name="maxDiscount" type="number" placeholder="e.g., 200" />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input name="usageLimit" type="number" placeholder="e.g., 100" />
              </div>
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input name="validFrom" type="date" required />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input name="validUntil" type="date" required />
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">Create Coupon</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No coupons found. Create your first coupon!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className={`bg-card border-border/50 ${!coupon.isActive && "opacity-60"}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-primary">{coupon.code}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(coupon.code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{coupon.discount}% OFF</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {coupon.minAmount && <p>Min. order: ₹{coupon.minAmount}</p>}
                  {coupon.maxDiscount && <p>Max. discount: ₹{coupon.maxDiscount}</p>}
                  <p>Used: {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</p>
                  <p>Expires: {new Date(coupon.validUntil).toLocaleDateString()}</p>
                </div>

                {coupon.usageLimit && (
                  <div className="mb-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${((coupon.usedCount || 0) / coupon.usageLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toggleActive(coupon.id)}>
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
