import { useState, useEffect } from "react";
import { AdminLoader } from "@/components/ui/AdminLoader";
import { Search, AlertTriangle, CheckCircle, Package, Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductsStore } from "@/stores/productsStore";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const toUrl = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  if (src.startsWith('products/') || src.startsWith('categories/')) {
    return `https://indhumathi-garments-images.s3.ap-south-1.amazonaws.com/${src}`;
  }
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${prefix}${path}`;
};

const Inventory = () => {
  const { products, fetchProducts, updateProduct, loading } = useProductsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const filteredInventory = products.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = products.filter((item) => item.stock < 10);
  const totalStock = products.reduce((sum, item) => sum + item.stock, 0);

  const handleEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditStock(currentStock);
  };

  const handleSave = async (id: string) => {
    try {
      // Use the store's updateProduct — it updates the API and the local store state immediately
      await updateProduct(id, { stock: editStock, inStock: editStock > 0 });
      setEditingId(null);
      toast({ title: "Success", description: "Stock updated successfully!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update stock", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditStock(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
        <p className="text-muted-foreground">Track and manage product stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold text-foreground">{totalStock} units</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Stock Items</p>
                <p className="text-2xl font-bold text-foreground">{products.length - lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-700">Low Stock Alert</p>
                <p className="text-sm text-orange-600">
                  {lowStockItems.length} products need restocking: {lowStockItems.slice(0, 3).map(i => i.name).join(", ")}
                  {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AdminLoader rows={8} cols={5} />
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No products found</div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Category</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Stock Level</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30">
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {item.image && (
                              <img
                                src={toUrl(item.image)}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-border"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-medium text-foreground block truncate">{item.name}</span>
                              <span className="text-xs text-muted-foreground md:hidden">{item.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">{item.category}</td>
                        <td className="py-3 px-2 sm:px-4">
                          {editingId === item.id ? (
                            <Input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(Number(e.target.value))}
                              className="w-20 sm:w-24 h-8 text-xs sm:text-sm"
                              min={0}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-16 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    item.stock < 10 ? 'bg-orange-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">{item.stock} units</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          {item.stock < 10 ? (
                            <span className="flex items-center gap-1.5 text-orange-600 text-xs sm:text-sm bg-orange-100 px-2 py-1 rounded-full w-fit">
                              <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">Low Stock</span>
                              <span className="sm:hidden">Low</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-green-600 text-xs sm:text-sm bg-green-100 px-2 py-1 rounded-full w-fit">
                              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">In Stock</span>
                              <span className="sm:hidden">OK</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleSave(item.id)}
                              >
                                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleCancel}
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => handleEdit(item.id, item.stock)}
                            >
                              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
