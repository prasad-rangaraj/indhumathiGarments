import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductsStore } from "@/stores/productsStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { products, loading, fetchProducts, deleteProduct } = useProductsStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        try {
            await deleteProduct(id);
            toast({ title: "Success", description: "Product deleted successfully" });
        } catch (error) {
            console.error(error);
        }
    }
  };

  const handleExport = () => {
    const exportData = products.map(p => ({
      Name: p.name,
      Price: p.price,
      Description: p.description,
      Category: p.category,
      Subcategory: p.subcategory || '',
      Stock: p.stock,
      Material: p.material || 'Cotton',
      Image: p.image || '',
      MetaTitle: p.metaTitle || '',
      MetaDescription: p.metaDescription || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Map excel columns to API fields
        const formattedData = data.map((item: any) => ({
          name: item.Name || item.name,
          price: Number(item.Price || item.price),
          description: item.Description || item.description,
          category: item.Category || item.category,
          subcategory: item.Subcategory || item.subcategory || '',
          stock: Number(item.Stock || item.stock || 0),
          material: item.Material || item.material || 'Cotton',
          image: item.Image || item.image || '',
          metaTitle: item.MetaTitle || item.metaTitle || '',
          metaDescription: item.MetaDescription || item.metaDescription || '',
          isActive: true
        }));

        if (formattedData.length === 0) {
          throw new Error("No data found in the excel file");
        }

        const { productsAPI } = await import('@/lib/api');
        // We'll need a bulk endpoint. Since I already added /products/bulk to routes/admin.ts:
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/products/bulk`, {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${useAuthStore.getState().token || ''}`
          },
          body: JSON.stringify({ products: formattedData })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Bulk import failed");
        }

        toast({ title: "Success", description: `Successfully imported ${formattedData.length} products` });
        fetchProducts(true);
      } catch (err: any) {
        toast({ title: "Import Failed", description: err.message, variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      { Name: 'Example Product', Price: 499, Description: 'Sample description', Category: 'Briefs', Subcategory: 'Cotton', Stock: 100, Material: 'Cotton', Image: '/uploads/sample.jpg', MetaTitle: 'SEO Title', MetaDescription: 'SEO Description' }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "products_template.xlsx");
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="hidden md:flex">
            <Download className="w-4 h-4 mr-2" /> Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
          />
          <Link to="/admin/products/add">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
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
                          {product.image ? (
                             <img
                               src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${product.image}`}
                               alt={product.name}
                               className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                             />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent flex items-center justify-center">
                              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-foreground block truncate">{product.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">{product.category}</td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-foreground">₹{product.price}</td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <div className="flex flex-col">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                             product.stock > 10 ? "bg-green-100 text-green-700" : product.stock > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                           }`}>
                             {product.stock} in stock
                           </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Link to={`/product/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </Link>
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

