import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await adminAPI.getNotifications();
      const unreadData = data.filter((n: any) => !n.isRead);
      setNotifications(unreadData);
      setUnreadCount(unreadData.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await adminAPI.markNotificationRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-full sm:h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Admin Notifications</DialogTitle>
            {unreadCount > 0 && (
              <button 
                onClick={async () => {
                  const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
                  setNotifications([]);
                  setUnreadCount(0);
                  Promise.all(unreadIds.map(id => adminAPI.markNotificationRead(id))).catch(console.error);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto w-full">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div key={n.id} className={`flex flex-col items-start p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/20' : ''}`}>
                  <div className="flex justify-between w-full mb-1">
                    <span className={`text-sm font-semibold ${!n.isRead ? 'text-black' : 'text-gray-600'}`}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => markAsRead(n.id, e)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap ml-2"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 leading-relaxed mb-2">{n.message}</span>
                  <div className="flex justify-between w-full items-center mt-auto">
                    <span className="text-xs text-gray-400">
                      {format(new Date(n.createdAt), "MMM d, yyyy HH:mm")}
                    </span>
                    {n.link && (
                      <Link 
                        to={n.link} 
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        View Details &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
