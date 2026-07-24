import { useState, useEffect } from "react";
import { AdminLoader } from "@/components/ui/AdminLoader";
import { format } from "date-fns";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: string;
  adminNotes?: string;
  orderTotal: number;
  orderDate: string;
  createdAt: string;
}

const Returns = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [statusAction, setStatusAction] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const data = await adminAPI.getReturns();
      setReturns(data);
    } catch (error) {
      toast({
        title: "Error fetching returns",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReturn || !statusAction) return;

    try {
      await adminAPI.updateReturnStatus(selectedReturn.id, {
        status: statusAction,
        adminNotes: notes
      });

      toast({
        title: "Return request updated",
        description: `The return request is now ${statusAction}`,
      });
      
      setIsDialogOpen(false);
      fetchReturns();
    } catch (error) {
      toast({
        title: "Error updating return",
        description: error instanceof Error ? error.message : "Failed to update return",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      case "Processed": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) return <div className="p-4"><AdminLoader rows={6} cols={5} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-pink-900">Return Requests</h1>
        <p className="text-muted-foreground mt-2">Manage customer return and refund requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Returns</CardTitle>
          <CardDescription>View and approve or reject any customer return requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No return requests found.
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-pink-700">{req.orderId}</div>
                      <div className="text-sm text-gray-500">₹{req.orderTotal}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.userName}</div>
                      <div className="text-xs text-gray-500">{req.userEmail}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedReturn?.id === req.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (open) {
                            setSelectedReturn(req);
                            setNotes(req.adminNotes || "");
                            setStatusAction(req.status);
                          } else {
                            setSelectedReturn(null);
                          }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Manage</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Return: {req.orderId}</DialogTitle>
                            <DialogDescription>Review details and update the status of this return request.</DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4 mt-2">
                            <div className="grid gap-2">
                              <span className="font-semibold text-sm">Customer Reason:</span>
                              <p className="text-sm bg-gray-50 p-3 rounded-md border">{req.reason}</p>
                            </div>
                            
                            <div className="grid gap-2">
                              <span className="font-semibold text-sm">Action Status:</span>
                              <Select value={statusAction} onValueChange={setStatusAction}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending (Return Requested)</SelectItem>
                                  <SelectItem value="Approved">Approved (Return Picked Up)</SelectItem>
                                  <SelectItem value="Refund Processed">Refund Processed</SelectItem>
                                  <SelectItem value="Processed">Refund Completed</SelectItem>
                                  <SelectItem value="Rejected">Rejected (Return Rejected)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-2">
                              <span className="font-semibold text-sm">Admin Notes (Optional):</span>
                              <Textarea 
                                placeholder="Add notes about decision..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateStatus}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Returns;
