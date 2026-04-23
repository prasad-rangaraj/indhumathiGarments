import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { products } from "@/data/products";
import { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Database, CheckCircle, AlertTriangle } from "lucide-react";

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setLoading(true);
    try {
      const { adminAPI } = await import('@/lib/api');
      const data = await adminAPI.seedProducts(products);

      toast({
        title: "Seed Successful",
        description: `${data.seededCount} products seeded successfully.`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Seed Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Seed Data Management</h2>
          <p className="text-muted-foreground">Visualize and sync static data to the database</p>
        </div>
        <Button onClick={handleSeed} disabled={loading} className="gap-2">
          <Database className="w-4 h-4" />
          {loading ? "Seeding..." : "Sync Products to DB"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Available Static Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sizes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.subcategory}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.sizes.join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedData;
