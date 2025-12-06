import { useState, useEffect, useMemo } from "react";
import { Search, Star, CheckCircle, XCircle, Trash2, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getReviews();
      setReviews(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const products = useMemo(() => [...new Set(reviews.map(r => r.product?.name || 'Unknown'))], [reviews]);

  const productStats = useMemo(() => {
    const stats: Record<string, { count: number; avgRating: number; ratings: number[] }> = {};
    reviews.forEach(review => {
      const productName = review.product?.name || 'Unknown';
      if (!stats[productName]) stats[productName] = { count: 0, avgRating: 0, ratings: [] };
      stats[productName].count++;
      stats[productName].ratings.push(review.rating);
      stats[productName].avgRating = stats[productName].ratings.reduce((a, b) => a + b, 0) / stats[productName].ratings.length;
    });
    return stats;
  }, [reviews]);

  const overallStats = useMemo(() => ({
    total: reviews.length,
    avgRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
    pending: reviews.filter(r => !r.isApproved && r.status !== 'Rejected').length
  }), [reviews]);

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const productName = review.product?.name || 'Unknown';
    const customerName = review.name || 'Unknown';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === "all" || productName === selectedProduct;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "Approved" && review.isApproved) ||
                         (statusFilter === "Pending" && !review.isApproved && review.status !== 'Rejected') ||
                         (statusFilter === "Rejected" && review.status === 'Rejected');
    return matchesSearch && matchesProduct && matchesStatus;
  }), [reviews, searchTerm, selectedProduct, statusFilter]);

  const updateStatus = async (reviewId: string, isApproved: boolean) => {
    try {
      await adminAPI.updateReview(reviewId, { isApproved });
      await loadReviews();
      toast({ title: "Success", description: `Review ${isApproved ? 'approved' : 'rejected'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update review", variant: "destructive" });
    }
  };

  const getStatusColor = (review: any) => {
    if (review.isApproved) return "bg-green-100 text-green-700";
    if (review.status === 'Rejected') return "bg-red-100 text-red-700";
    return "bg-orange-100 text-orange-700";
  };

  const getStatusText = (review: any) => {
    if (review.isApproved) return "Approved";
    if (review.status === 'Rejected') return "Rejected";
    return "Pending";
  };

  const getRatingColor = (rating: number) => rating >= 4 ? "text-green-600" : rating >= 3 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reviews & Ratings</h2>
        <p className="text-muted-foreground">Moderate customer reviews</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-primary/10"><Star className="w-5 h-5 text-primary fill-primary" /></div><div><p className="text-sm text-muted-foreground">Total Reviews</p><p className="text-2xl font-bold text-foreground">{overallStats.total}</p></div></div></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-yellow-100"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Avg Rating</p><p className="text-2xl font-bold text-foreground">{overallStats.avgRating.toFixed(1)}</p></div></div></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-orange-100"><Filter className="w-5 h-5 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-foreground">{overallStats.pending}</p></div></div></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-green-100"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Approved</p><p className="text-2xl font-bold text-foreground">{reviews.filter(r => r.isApproved).length}</p></div></div></CardContent></Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Ratings by Product</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(productStats).map(([product, stats]) => (
              <div key={product} className={`p-3 rounded-lg border cursor-pointer hover:shadow-md ${selectedProduct === product ? 'border-primary bg-primary/5' : 'border-border/50'}`} onClick={() => setSelectedProduct(selectedProduct === product ? "all" : product)}>
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground truncate">{product}</span><div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className={`text-sm font-semibold ${getRatingColor(stats.avgRating)}`}>{stats.avgRating.toFixed(1)}</span></div></div>
                <p className="text-xs text-muted-foreground mt-1">{stats.count} reviews</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search reviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}><SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by product" /></SelectTrigger><SelectContent><SelectItem value="all">All Products</SelectItem>{products.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Filter by status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reviews found</div>
          ) : (
            filteredReviews.map((review) => {
              const statusColor = getStatusColor(review);
              const statusText = getStatusText(review);
              const productName = review.product?.name || 'Unknown';
              return (
                <div key={review.id} className="p-4 rounded-lg border border-border/50 bg-card hover:shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-foreground">{review.name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-primary font-medium">{productName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>{statusText}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}</div>
                        <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>{review.rating}.0</span>
                        <span className="text-sm text-muted-foreground">• {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.title && <p className="font-medium text-foreground mb-1">{review.title}</p>}
                      <p className="text-sm text-foreground">{review.content}</p>
                    </div>
                    <div className="flex gap-2">
                      {!review.isApproved && review.status !== 'Rejected' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(review.id, true)}>
                            <CheckCircle className="w-4 h-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(review.id, false)}>
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews;
