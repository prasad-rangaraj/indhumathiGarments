import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { NotificationBell } from "./NotificationBell";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border/50 flex items-center justify-between px-3 sm:px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2 sm:mr-4" />
              <h1 className="text-base sm:text-lg font-semibold text-foreground">Indhumathi Admin</h1>
            </div>
            <NotificationBell />
          </header>
          <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
