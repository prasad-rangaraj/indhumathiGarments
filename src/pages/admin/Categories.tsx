import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProductsStore } from "@/stores/productsStore";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";


const Categories = () => {
  const { products, fetchProducts } = useProductsStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newMetaTitle, setNewMetaTitle] = useState("");
  const [newMetaDescription, setNewMetaDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const { toast } = useToast();

  const loadCategories = async () => {
    try {
      const data = await adminAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    loadCategories();
  }, [products.length, fetchProducts]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      await adminAPI.createCategory({ 
        name: newCategory, 
        isActive: true,
        metaTitle: newMetaTitle || undefined,
        metaDescription: newMetaDescription || undefined
      });
      setNewCategory("");
      setNewMetaTitle("");
      setNewMetaDescription("");
      await loadCategories();
      toast({ title: "Success", description: "Category added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await adminAPI.deleteCategory(categoryToDelete.id);
      await loadCategories();
      toast({ title: "Success", description: "Category and associated products deleted successfully" });
      setCategoryToDelete(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" });
    }
  };

  // Merge managed categories with product counts
  const categoriesList = categories.map((cat) => ({
    ...cat,
    products: products.filter(p => p.category === cat.name).length,
    subcategories: [] // TODO: If subcategories are managed, fetch them. For now empty or derive?
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Categories</h2>
        <p className="text-muted-foreground">Manage product categories and subcategories</p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title (SEO)</label>
              <Input
                placeholder="SEO Title"
                value={newMetaTitle}
                onChange={(e) => setNewMetaTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description (SEO)</label>
              <Input
                placeholder="SEO Description"
                value={newMetaDescription}
                onChange={(e) => setNewMetaDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={handleAddCategory}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {categoriesList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriesList.map((category) => (
            <Card key={category.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">

                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.products} products</p>
                      {category.description && <p className="text-xs text-muted-foreground mt-1">{category.description}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setCategoryToDelete(category)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {/* Subcategories display removed for now as schema doesn't support them explicitly in Category model yet */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription className="text-red-500 font-medium pt-2">
              Are you sure you want to delete the "{categoryToDelete?.name}" category?
              <br /><br />
              This category currently contains {categoryToDelete?.products} product(s). 
              If you proceed, all these products will be PERMANENTLY deleted from the database!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Delete Category & Products</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
