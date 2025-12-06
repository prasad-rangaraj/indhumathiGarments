import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductsStore } from "@/stores/productsStore";

const Categories = () => {
  const { categories, products, fetchProducts, fetchCategories } = useProductsStore();
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    if (Object.keys(categories).length === 0) fetchCategories();
  }, [products.length, categories, fetchProducts, fetchCategories]);

  // Convert categories object to array with product counts
  const categoriesList = Object.entries(categories).map(([name, subcategories]) => ({
    name,
    subcategories: subcategories as string[],
    products: products.filter(p => p.category === name).length,
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
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {categoriesList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No categories found. Categories are automatically created from products.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriesList.map((category) => (
            <Card key={category.name} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.products} products</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.length > 0 ? (
                    category.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground"
                      >
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No subcategories</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
