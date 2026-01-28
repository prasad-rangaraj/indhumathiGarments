import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductsStore } from "@/stores/productsStore";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { products, loading, fetchProducts, deleteProduct } = useProductsStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        try {
            await deleteProduct(id);
            // Toast handled by store logic? Store logic throws error, but doesn't toast success.
            // We should toast success here. (Assuming we have useToast but we need to import it)
        } catch (error) {
            console.error(error);
        }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Link to="/admin/products/add">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-foreground block truncate">{product.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">{product.category}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-foreground">₹{product.price}</td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.inStock 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Link to={`/admin/products/edit/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

export default Products;
