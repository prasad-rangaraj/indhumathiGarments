import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Image,
  Star,
  Ticket,
  Settings,
  ChevronDown,
  LogOut,
  TrendingUp,
  Database,
  FileEdit,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import logoImg from "@/assets/logo-new.png";
import { useAuthStore } from "@/stores/authStore";

const allNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  {
    title: "Products",
    icon: Package,
    subItems: [
      { title: "All Products", url: "/admin/products" },
      { title: "Add Product", url: "/admin/products/add" },
      { title: "Categories", url: "/admin/products/categories" },
    ],
  },
  { title: "Inventory", url: "/admin/products/inventory", icon: Package },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Returns", url: "/admin/returns", icon: Package },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Enquiries", url: "/admin/enquiries", icon: MessageSquare },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Coupons", url: "/admin/coupons", icon: Ticket },
  // Super Admin only items:
  { title: "Admin Staff", url: "/admin/staff", icon: Users, superAdminOnly: true },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: FileEdit, superAdminOnly: true },

  { title: "Reports", url: "/admin/reports", icon: TrendingUp, superAdminOnly: true },
  { title: "Settings", url: "/admin/settings", icon: Settings, superAdminOnly: true },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const mainNavItems = allNavItems.filter(item => !item.superAdminOnly || isSuperAdmin);

  const isActive = (path: string) => location.pathname === path;
  const isProductsActive = location.pathname.startsWith("/admin/products");

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/30">
        <NavLink to="/admin" className="flex items-center gap-3">
          <img src={logoImg} alt="Indhumathi" className="h-10" />
          <div>
            <span className="font-semibold text-foreground text-sm">Admin Panel</span>
          </div>
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) =>
                item.subItems ? (
                  <Collapsible key={item.title} defaultOpen={item.title === 'Products' || isProductsActive}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between hover:bg-primary/10">
                          <span className="flex items-center gap-3">
                            <item.icon className="w-4 h-4" />
                            {item.title}
                          </span>
                          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  className={`${
                                    isActive(subItem.url)
                                      ? "bg-primary/20 text-primary font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  {subItem.title}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.url)
                            ? "bg-primary/20 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.title}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
