import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductsStore } from "@/stores/productsStore";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Categories = () => {
  const { products, fetchProducts } = useProductsStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
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
      await adminAPI.createCategory({ name: newCategory, isActive: true });
      setNewCategory("");
      await loadCategories();
      toast({ title: "Success", description: "Category added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await adminAPI.deleteCategory(id);
      await loadCategories();
      toast({ title: "Success", description: "Category deleted successfully" });
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
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1"
            />
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={handleAddCategory}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adding..." : "Add"}
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
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.products} products</p>
                    {category.description && <p className="text-xs text-muted-foreground mt-1">{category.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {/* Subcategories display removed for now as schema doesn't support them explicitly in Category model yet */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
