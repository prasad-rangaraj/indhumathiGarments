import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { productsAPI } from "@/lib/api";
import { useProductsStore } from "@/stores/productsStore";
import { useAdminStore } from "@/stores/adminStore";
import { ImageUploader } from "@/components/admin/ImageUploader";

// Default sizes
const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const isSameImage = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a instanceof File || b instanceof File) return false;
  const getPath = (url: string) => {
    try {
      if (url.startsWith('http')) {
        return new URL(url).pathname.split('?')[0];
      }
      return url.split('?')[0];
    } catch {
      return url.split('?')[0];
    }
  };
  return getPath(a) === getPath(b);
};

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
    stock: "0",
    material: "Cotton",
    image: "" as string | File,
    images: [] as (string | File)[],
    colors: [] as { name: string; hex?: string; images: (string | File)[]; primaryImage?: string | File }[],
    showColorThumbnails: false,
    metaTitle: "",
    metaDescription: "",
    gender: "women" as "women" | "men" | "unisex",
  });

  const [availableSizes, setAvailableSizes] = useState<string[]>(DEFAULT_SIZES);
  const [customSize, setCustomSize] = useState("");
  const [customSubcategory, setCustomSubcategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            await Promise.all([fetchCategories(), fetchMasterCategories()]);
            if (id) {
                const product = await productsAPI.getById(id);
                setFormData({
                    name: product.name,
                    description: product.description || "",
                    price: (product.price || 0).toString(),
                    category: product.category,
                    subcategory: product.subcategory,
                    sizes: product.sizes || [],
                    inStock: product.inStock !== undefined ? product.inStock : true,
                    stock: (product.stock || 0).toString(),
                    material: product.material || "Cotton",
                    image: product.image || "",
                    images: product.images || [],
                    colors: (product.colors || []).map(c => ({
                      ...c,
                      primaryImage: c.primaryImage || (c.images && c.images.length > 1 ? c.images[1] : c.images?.[0]),
                    })),
                    showColorThumbnails: product.showColorThumbnails || false,
                    metaTitle: product.metaTitle || "",
                    metaDescription: product.metaDescription || "",
                    gender: (product.gender || "women") as "women" | "men" | "unisex",
                });
                setAvailableSizes(Array.from(new Set([...DEFAULT_SIZES, ...(product.sizes || [])])));
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

  const subcategoryList = formData.category ? (categories[formData.category]?.subcategories || []) : [];

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleAddCustomSize = () => {
    if (!customSize.trim()) return;
    const formattedSize = customSize.trim().toUpperCase();
    
    if (!availableSizes.includes(formattedSize)) {
      setAvailableSizes([...availableSizes, formattedSize]);
    }
    
    if (!formData.sizes.includes(formattedSize)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, formattedSize],
      }));
    }
    
    setCustomSize("");
  };

  const handleAddCustomSubcategory = () => {
    if (!customSubcategory.trim()) return;
    const formatted = customSubcategory.trim();
    setFormData((prev) => ({ ...prev, subcategory: formatted }));
    setCustomSubcategory("");
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

    setIsSubmitting(true);
    try {
      if (!id) return;

      const { adminAPI } = await import('@/lib/api');
      
      let primaryImageKey = formData.image;
      if (formData.image instanceof File) {
        const res = await adminAPI.uploadImage(formData.image, 'products');
        primaryImageKey = res.key;
      }

      const additionalImageKeys = await Promise.all(
        formData.images.map(async (img) => {
          if (img instanceof File) {
            const res = await adminAPI.uploadImage(img, 'products');
            return res.key;
          }
          return img;
        })
      );
      
      const uploadedColors = await Promise.all(
        formData.colors.map(async (colorObj) => {
          const colorImagesKeys = await Promise.all(
            colorObj.images.map(async (img) => {
              if (img instanceof File) {
                const res = await adminAPI.uploadImage(img, 'products');
                return res.key;
              }
              return img;
            })
          );
          let primaryImageKey: string | undefined;
          if (colorObj.primaryImage) {
            if (colorObj.primaryImage instanceof File) {
              const primaryIdx = colorObj.images.indexOf(colorObj.primaryImage);
              primaryImageKey = primaryIdx >= 0 ? colorImagesKeys[primaryIdx] as string : undefined;
            } else {
              primaryImageKey = colorObj.primaryImage as string;
            }
          }
          if (!primaryImageKey && colorImagesKeys.length > 0) {
            primaryImageKey = colorImagesKeys.length > 1 ? colorImagesKeys[1] as string : colorImagesKeys[0] as string;
          }
          return { name: colorObj.name, hex: colorObj.hex, images: colorImagesKeys as string[], primaryImage: primaryImageKey };
        })
      );

      await updateProduct(id, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.subcategory,
        sizes: formData.sizes,
        inStock: formData.inStock,
        stock: parseInt(formData.stock) || 0,
        material: formData.material,
        image: (primaryImageKey as string) || null,
        images: additionalImageKeys as string[] || [],
        colors: uploadedColors,
        showColorThumbnails: formData.showColorThumbnails,
        isActive: true,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        gender: formData.gender,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
      return <div className="p-8 text-center">Loading product details...</div>;
  }

  return (
    <div className="space-y-6 relative">
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card border shadow-lg">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-foreground">Saving Product...</p>
          </div>
        </div>
      )}
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
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    required
                  />
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
                <Label htmlFor="image">Primary Image</Label>
                <ImageUploader 
                  value={formData.image} 
                  onChange={(val) => setFormData({ ...formData, image: val })} 
                  multiple={false} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Additional Images</Label>
                <ImageUploader 
                  value={formData.images} 
                  onChange={(val) => setFormData({ ...formData, images: val })} 
                  multiple={true} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Product Colors</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="showColorThumbnails" className="text-sm text-muted-foreground cursor-pointer">
                  Use Image Thumbnails instead of Color Dots
                </Label>
                <Switch
                  id="showColorThumbnails"
                  checked={formData.showColorThumbnails}
                  onCheckedChange={(checked) => setFormData({ ...formData, showColorThumbnails: checked })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.colors.map((color, index) => (
                <div key={index} className="p-4 border rounded-md relative space-y-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    onClick={() => {
                      const newColors = [...formData.colors];
                      newColors.splice(index, 1);
                      setFormData({ ...formData, colors: newColors });
                    }}
                    type="button"
                  >
                    Remove
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color Name *</Label>
                      <Input 
                        value={color.name}
                        onChange={(e) => {
                          const newColors = formData.colors.map((c, i) =>
                            i === index ? { ...c, name: e.target.value } : c
                          );
                          setFormData({ ...formData, colors: newColors });
                        }}
                        placeholder="e.g., Red, Blue, Dark Black"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color Code (Hex) *</Label>
                      <div className="flex gap-2 items-center">
                        <Input 
                          type="color"
                          value={color.hex || "#000000"}
                          onChange={(e) => {
                            const newColors = formData.colors.map((c, i) =>
                              i === index ? { ...c, hex: e.target.value } : c
                            );
                            setFormData({ ...formData, colors: newColors });
                          }}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input 
                          type="text"
                          value={color.hex || ""}
                          onChange={(e) => {
                            const newColors = formData.colors.map((c, i) =>
                              i === index ? { ...c, hex: e.target.value } : c
                            );
                            setFormData({ ...formData, colors: newColors });
                          }}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Color Images</Label>
                    <ImageUploader 
                      value={color.images} 
                      onChange={(val) => {
                        const imgs = val as (string | File)[];
                        const newColors = formData.colors.map((c, i) => {
                          if (i !== index) return c;
                          let nextPrimary = c.primaryImage;
                          const isFirstImg = c.images.length > 0 && isSameImage(nextPrimary, c.images[0]);
                          if (!nextPrimary || (imgs.length > 1 && isFirstImg)) {
                            nextPrimary = imgs.length > 1 ? imgs[1] : imgs[0];
                          }
                          const exists = imgs.some(img => isSameImage(nextPrimary, img));
                          if (!exists) {
                            nextPrimary = imgs.length > 1 ? imgs[1] : imgs[0];
                          }
                          return { ...c, images: imgs, primaryImage: nextPrimary };
                        });
                        setFormData({ ...formData, colors: newColors });
                      }} 
                      multiple={true} 
                    />
                    {color.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Click an image to set it as Primary (shown in cart &amp; orders)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {color.images.map((img, imgIdx) => {
                            const previewSrc = img instanceof File ? URL.createObjectURL(img) : img;
                            const defaultIdx = color.images.length > 1 ? 1 : 0;
                            const isPrimary = isSameImage(color.primaryImage, img) ||
                              (imgIdx === defaultIdx && !color.primaryImage);
                            return (
                              <div
                                key={imgIdx}
                                className={`relative w-16 h-16 rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${
                                  isPrimary ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-border hover:border-primary/60'
                                }`}
                                onClick={() => {
                                  const newColors = formData.colors.map((c, i) =>
                                    i === index ? { ...c, primaryImage: img } : c
                                  );
                                  setFormData({ ...formData, colors: newColors });
                                }}
                              >
                                <img src={previewSrc} alt={`color-${imgIdx}`} className="w-full h-full object-cover" />
                                {isPrimary && (
                                  <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = color.images.filter((_, i) => i !== imgIdx);
                                    const newColors = formData.colors.map((c, i) => {
                                      if (i !== index) return c;
                                      let nextPrimary = c.primaryImage;
                                      if (isSameImage(nextPrimary, img)) {
                                        nextPrimary = filtered.length > 1 ? filtered[1] : filtered[0];
                                      }
                                      return {
                                        ...c,
                                        images: filtered,
                                        primaryImage: nextPrimary,
                                      };
                                    });
                                    setFormData({ ...formData, colors: newColors });
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({ ...formData, colors: [...formData.colors, { name: "", hex: "#000000", images: [], primaryImage: undefined }] })}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Color
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">SEO Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO Title (e.g., Buy Premium Shorts)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Short description for search engine results..."
                  rows={2}
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
                    {subcategoryList.includes(formData.subcategory) || !formData.subcategory ? null : (
                      <option value={formData.subcategory}>{formData.subcategory}</option>
                    )}
                    {subcategoryList.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="Add custom subcategory" 
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddCustomSubcategory}>Add</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gender Selection */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Gender *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {(['women', 'men', 'unisex'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                      formData.gender === g
                        ? g === 'women'
                          ? 'border-pink-400 bg-pink-50 text-pink-700'
                          : g === 'men'
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-purple-400 bg-purple-50 text-purple-700'
                        : 'border-border/50 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    {g === 'women' ? '♀ Women' : g === 'men' ? '♂ Men' : '⚧ Unisex'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">This controls which gender section the product appears in.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Sizes *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableSizes.map((size) => (
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
              <div className="flex gap-2">
                <Input
                  placeholder="Custom size (e.g., 32, 34, 3XL)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={handleAddCustomSize}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
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
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
