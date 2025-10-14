import React from "react";
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
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const PatientSidebar = ({ patient }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const patientUser = patient?.user || {};
  const name = patientUser.name || patient?.name || "Tên bệnh nhân";
  const email = patientUser.email || patient?.email || "Email";

  const navigationItems = [
    {
      title: "Patients Page",
      url: user?.id ? `/patient/${user.id}` : "/patient",
      icon: Home,
    },
    {
      title: "Doctor List",
      url: "/patient/doctors",
      icon: Users,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar className="border-0 h-screen bg-[#00A646] text-white">
          {/* Logo */}
          <SidebarHeader className="p-4 bg-[#00A646]">
            <img
              src="/icon/logo.png"
              alt="Healthy Logo"
              className="!w-[120px] mx-auto"
            />
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="bg-[#00A646]">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => navigate(item.url)}
                          className={`flex w-full items-center gap-3 p-4 rounded-md font-semibold transition-colors ${
                            location.pathname === item.url
                              ? "bg-purple-700 text-white"
                              : "text-white/90 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="p-4 bg-[#00A646] border-t border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center font-bold text-green-900">
                {name?.charAt(0).toUpperCase() || "P"}
              </div>
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-xs text-green-100">Patient</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white w-full"
            >
              Log out
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-16 items-center border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="ml-4 text-lg font-semibold text-gray-700">
              Healthy Patient Portal
            </h1>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PatientSidebar;
