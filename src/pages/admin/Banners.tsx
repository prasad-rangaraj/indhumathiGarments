import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStore } from "@/stores/adminStore";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Banners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { fetchBanners } = useAdminStore();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load banners", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (bannerId: string) => {
    try {
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) return;
      
      await adminAPI.updateBanner(bannerId, { isActive: !banner.isActive });
      await loadBanners();
      toast({ title: "Success", description: `Banner ${banner.isActive ? 'deactivated' : 'activated'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update banner", variant: "destructive" });
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    
    try {
      await adminAPI.deleteBanner(bannerId);
      await loadBanners();
      toast({ title: "Success", description: "Banner deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete banner", variant: "destructive" });
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      image: formData.get('image') as string,
      link: formData.get('link') as string || null,
      position: formData.get('position') as string || 'hero',
      isActive: true,
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      await adminAPI.createBanner(data);
      await loadBanners();
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      toast({ title: "Success", description: "Banner created successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create banner", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Banner Management</h2>
          <p className="text-muted-foreground">Manage homepage banners and offers</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Create New Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="title" placeholder="e.g., Summer Collection" required />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select name="position" defaultValue="hero">
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input name="description" placeholder="e.g., Flat 40% Off" />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input name="image" placeholder="https://example.com/image.jpg" required />
                </div>
                <div className="space-y-2">
                  <Label>Link (optional)</Label>
                  <Input name="link" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input name="order" type="number" placeholder="0" defaultValue="0" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">Create Banner</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No banners found. Create your first banner!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className={`bg-card border-border/50 overflow-hidden ${!banner.isActive && "opacity-60"}`}>
              <div className="relative h-40">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="font-semibold text-white">{banner.title}</h3>
                    {banner.description && <p className="text-sm text-white/80">{banner.description}</p>}
                  </div>
                </div>
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                }`}>
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{banner.position} Banner</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleActive(banner.id)}
                      title={banner.isActive ? "Deactivate" : "Activate"}
                    >
                      {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Banners;
