import { useState, useEffect, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserMinus, FileEdit, Activity, Search, Eye, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

const actionConfig: Record<string, { label: string; icon: any; color: string }> = {
  'UPDATE_ROLE': { label: 'Role Update', icon: Shield, color: 'text-blue-600 bg-blue-100 border-blue-200' },
  'DELETE_USER': { label: 'Delete User', icon: UserMinus, color: 'text-red-600 bg-red-100 border-red-200' },
  'UPDATE_ORDER_STATUS': { label: 'Order Update', icon: FileEdit, color: 'text-yellow-600 bg-yellow-100 border-yellow-200' },
  'CREATE_CATEGORY': { label: 'Create Category', icon: Activity, color: 'text-green-600 bg-green-100 border-green-200' },
  'CREATE_PRODUCT': { label: 'Create Product', icon: Activity, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  'UPDATE_PRODUCT': { label: 'Update Product', icon: FileEdit, color: 'text-teal-600 bg-teal-100 border-teal-200' },
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Dialog State
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await adminAPI.getAuditLogs();
      setLogs(response);
    } catch (error) {
      toast({
        title: "Error fetching logs",
        description: error instanceof Error ? error.message : "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDetailsText = (log: AuditLog) => {
    try {
      const parsed = JSON.parse(log.details || '{}');
      if (log.action === 'UPDATE_ROLE') return `Role: ${parsed.oldRole} \u2192 ${parsed.newRole}`;
      if (log.action === 'DELETE_USER') return `Deleted ${parsed.deletedEmail}`;
      if (log.action === 'UPDATE_ORDER_STATUS') return `Status: ${parsed.newStatus}`;
      return Object.keys(parsed).length > 0 ? "Payload attached" : log.details;
    } catch {
      return log.details || 'N/A';
    }
  };

  const formattedJson = (details: string) => {
    try {
      return JSON.stringify(JSON.parse(details), null, 2);
    } catch {
      return details;
    }
  };

  // Derive filter options
  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort();
  const uniqueEntities = Array.from(new Set(logs.map(l => l.entityType))).sort();

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
      const matchesEntity = entityFilter === "ALL" || log.entityType === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, searchTerm, actionFilter, entityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, entityFilter]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track and monitor administrative actions across the platform.
          </p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search admin, entity, or details..."
                className="pl-9 w-full bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[160px] bg-background">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>{action.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[160px] bg-background">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Entities</SelectItem>
                  {uniqueEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[200px]">Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No audit logs match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => {
                    const config = actionConfig[log.action] || { label: log.action.replace(/_/g, ' '), icon: Activity, color: 'text-gray-600 bg-gray-100 border-gray-200' };
                    const ActionIcon = config.icon;
                    return (
                      <TableRow key={log.id} className="hover:bg-muted/20 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md border ${config.color}`}>
                              <ActionIcon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm">{config.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{log.adminEmail}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{log.entityType}</span>
                            <span className="text-xs text-muted-foreground font-mono">{log.entityId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {getDetailsText(log)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex flex-col items-end">
                            <span className="text-sm">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${selectedLog ? (actionConfig[selectedLog.action]?.color || 'bg-gray-100 text-gray-600') : ''}`}>
                <Activity className="w-5 h-5" />
              </div>
              Log Details
            </DialogTitle>
            <DialogDescription>
              Raw payload data for this administrative action.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Actor (Admin)</span>
                  <span className="font-medium">{selectedLog.adminEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Action</span>
                  <Badge variant="outline">{selectedLog.action}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Target Entity</span>
                  <span className="font-medium">{selectedLog.entityType} <span className="font-mono text-xs text-muted-foreground ml-1">{selectedLog.entityId}</span></span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase mb-1">Timestamp</span>
                  <span>{format(new Date(selectedLog.createdAt), 'PPpp')}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Payload Details</h4>
                <div className="relative">
                  <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg overflow-auto text-sm font-mono max-h-[400px] shadow-inner border border-border/10">
                    <code>{formattedJson(selectedLog.details)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
