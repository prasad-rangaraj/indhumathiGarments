import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { productsAPI } from "@/lib/api";
import { useProductsStore } from "@/stores/productsStore";
import { useAdminStore } from "@/stores/adminStore";

const sizes = ["S", "M", "L", "XL", "XXL"];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, fetchCategories, updateProduct } = useProductsStore();
  const { categories: masterCategories, fetchCategories: fetchMasterCategories } = useAdminStore();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    sizes: [] as string[],
    inStock: true,
    material: "Cotton",
    image: "",
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            await Promise.all([fetchCategories(), fetchMasterCategories()]);
            if (id) {
                const product = await productsAPI.getById(id);
                setFormData({
                    name: product.name,
                    description: product.description || "",
                    price: product.price.toString(),
                    category: product.category,
                    subcategory: product.subcategory,
                    sizes: product.sizes || [],
                    inStock: product.inStock !== undefined ? product.inStock : true,
                    material: product.material || "Cotton",
                    image: product.image || "",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch product details",
                variant: "destructive",
            });
            navigate("/admin/products");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id, fetchCategories, fetchMasterCategories, navigate, toast]);

  const categoryList = Array.from(new Set([
    ...Object.keys(categories),
    ...(masterCategories || []).map((c: any) => c.name)
  ])).sort();

  const subcategoryList = formData.category ? (categories[formData.category] || []) : [];

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.subcategory || formData.sizes.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!id) return;
      
      await updateProduct(id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        sizes: formData.sizes,
        inStock: formData.inStock,
        material: formData.material,
        image: formData.image || null,
        isActive: true,
      });

      toast({
        title: "Success",
        description: "Product has been updated successfully",
      });
      navigate("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
      return <div className="p-8 text-center">Loading product details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Product</h2>
          <p className="text-muted-foreground">Update existing product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="inStock" className="text-base">Available in Stock</Label>
                      <p className="text-xs text-muted-foreground">Disable to mark as Out of Stock</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        id="inStock"
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g., Cotton"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Category *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryList.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {formData.category && (
                <div className="space-y-2 mt-4">
                  <Label>Subcategory *</Label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoryList.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Sizes *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      formData.sizes.includes(size)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/50 hover:bg-muted/30"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {formData.sizes.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">Select at least one size</p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Update Product
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
