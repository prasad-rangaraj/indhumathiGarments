import { useState, useEffect, useMemo } from "react";
import { AdminLoader } from "@/components/ui/AdminLoader";
import { Search, Mail, CheckCircle, Clock, Reply, Calendar as CalendarIcon, MessageCircle, Filter } from "lucide-react";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAdminStore } from "@/stores/adminStore";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Enquiries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | "New" | "Read" | "Replied" | "Closed">("all");
  const { toast } = useToast();
  const { fetchEnquiries } = useAdminStore();

  useEffect(() => {
    loadEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await fetchEnquiries();
      setEnquiries(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load enquiries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = enquiries.filter(e => e.status === 'New').length;
  const pendingCount = enquiries.filter(e => e.status === 'New' || e.status === 'Read').length;
  const totalCount = enquiries.length;

  const filteredEnquiries = useMemo(() => {
    let filtered = enquiries.filter(
      (enquiry) =>
        enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(enquiry => {
        const enquiryDate = parseISO(enquiry.createdAt);
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(enquiryDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else if (dateRange.from) {
          return enquiryDate >= startOfDay(dateRange.from);
        } else if (dateRange.to) {
          return enquiryDate <= endOfDay(dateRange.to);
        }
        return true;
      });
    }

    return filtered;
  }, [enquiries, searchTerm, statusFilter, dateRange]);

  const updateStatus = async (enquiryId: string, newStatus: string) => {
    try {
      await adminAPI.updateEnquiry(enquiryId, { status: newStatus });
      await loadEnquiries();
      toast({ title: "Success", description: "Enquiry status updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update enquiry", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-700";
      case "Read": return "bg-yellow-100 text-yellow-700";
      case "Replied": return "bg-green-100 text-green-700";
      case "Closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Customer Enquiries</h2>
        <p className="text-muted-foreground">Manage customer inquiries and support requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enquiries</p>
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{enquiries.filter(e => e.status === 'Replied' || e.status === 'Closed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[250px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Read">Read</SelectItem>
                <SelectItem value="Replied">Replied</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <AdminLoader rows={5} cols={4} />
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No enquiries found</div>
          ) : (
            filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className="p-4 rounded-lg border border-border/50 bg-card hover:shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-foreground">{enquiry.name}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{enquiry.email}</span>
                      {enquiry.phone && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{enquiry.phone}</span>
                        </>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground mb-2">{enquiry.subject}</h3>
                    <p className="text-sm text-foreground mb-2">{enquiry.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="w-3 h-3" />
                      {format(parseISO(enquiry.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {enquiry.status === "New" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(enquiry.id, "Read")}>
                        Mark as Read
                      </Button>
                    )}
                    {enquiry.status !== "Replied" && enquiry.status !== "Closed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(enquiry.id, "Replied")}>
                        <Reply className="w-4 h-4 mr-1" />
                        Mark as Replied
                      </Button>
                    )}
                    {enquiry.status !== "Closed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(enquiry.id, "Closed")}>
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Enquiries;
