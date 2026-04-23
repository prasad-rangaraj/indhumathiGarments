import { useState, useEffect } from "react";
import { format } from "date-fns";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, UserMinus, FileEdit, Activity } from "lucide-react";
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
  'UPDATE_ROLE': { label: 'Role Update', icon: Shield, color: 'text-blue-500 bg-blue-100' },
  'DELETE_USER': { label: 'Delete User', icon: UserMinus, color: 'text-red-500 bg-red-100' },
  'UPDATE_ORDER_STATUS': { label: 'Order Update', icon: FileEdit, color: 'text-yellow-600 bg-yellow-100' },
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
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
      return log.details;
    } catch {
      return log.details || 'N/A';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-pink-900">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          Track sensitive administrative actions across the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 100 logged actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const config = actionConfig[log.action] || { label: log.action, icon: Activity, color: 'text-gray-500 bg-gray-100' };
                    const ActionIcon = config.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{log.adminEmail}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-0 ${config.color}`}>
                            <ActionIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {log.entityType} ({log.entityId.slice(0, 8)})
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getDetailsText(log)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
