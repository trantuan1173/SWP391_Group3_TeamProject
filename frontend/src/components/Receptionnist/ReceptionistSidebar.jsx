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
import { LayoutDashboard, Users, Calendar, Bed, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const ReceptionistSideBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navigationItems = [
        { title: "Dashboard", url: "/receptionist/dashboard", icon: LayoutDashboard },
        { title: "Appointments", url: "/receptionist/appointments", icon: Calendar },
        { title: "Patients", url: "/receptionist/patients", icon: Bed },
        { title: "Doctors", url: "/receptionist/doctors", icon: Users },
        { title: "News", url: "/receptionist/news", icon: Newspaper },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                {/* Sidebar */}
                <Sidebar className="border-0 h-screen bg-[#00A646]">
                    <SidebarHeader className="p-4 bg-[#00A646]">
                        <img
                            src="/icon/logo.png"
                            alt="Healthy People Logo"
                            className="!w-[150px] mx-auto"
                        />

                    </SidebarHeader>

                    <SidebarContent className="bg-[#00A646]">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigationItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <button
                                                    onClick={() => navigate(item.url)}
                                                    className={`flex w-full items-center gap-3 !p-6 !rounded-md font-bold transition-colors ${
                                                        location.pathname === item.url
                                                          ? "bg-purple-700 text-white"
                                                          : "text-black hover:bg-purple-700 hover:text-white active:bg-purple-800"
                                                    }`}
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

                    <SidebarFooter className="p-4 bg-[#00A646]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-800 font-bold text-sm">
                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                            </div>
                            <div className="text-center mt-2">
                                <div className="font-semibold">{user?.name}</div>
                                <div className="text-sm text-green-200">
                                    {user?.roles?.[0]?.name}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white w-full"
                        >
                            Logout
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                {/* Main content */}
                <SidebarInset className="flex flex-col flex-1">
                    <header className="flex h-16 items-center border-b bg-white px-4">
                        <SidebarTrigger className="-ml-1" />
                        <h1 className="ml-4 text-lg font-semibold text-gray-700">
                            Clinic Management System
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

export default ReceptionistSideBar;