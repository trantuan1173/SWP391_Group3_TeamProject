import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FlaskConical,
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/admin/user",
    icon: Users,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Laboratory",
    url: "/admin/labs",
    icon: FlaskConical,
  },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar với background xanh lá */}
        <Sidebar className={"border-0 h-screen bg-[#00A646]"}>
          <SidebarHeader className="border-b border-green-500 p-4 bg-[#00A646]">
            <img
              src="/icon/logo.png"
              alt="Healthy People Logo"
              className="!w-[150px] ml-auto mr-auto filter"
            />
          </SidebarHeader>

          <SidebarContent className="bg-[#00A646]">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="!p-0">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton variant="admin" asChild>
                        <button
                          onClick={() => navigate(item.url)}
                          className="flex w-full items-center !p-6 !rounded-md hover:!text-white active:!bg-purple-800 text-black transition-colors font-bold"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-green-500 p-4 bg-[#00A646] md:rounded-br-[50px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-800 font-bold text-sm">H</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-white">
                  HEALTHY
                </span>
                <span className="text-xs text-green-200">PEOPLE</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1">
          {/* Header với trigger button */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 bg-gray-50">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
