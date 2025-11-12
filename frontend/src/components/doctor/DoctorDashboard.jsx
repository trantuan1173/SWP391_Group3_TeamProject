import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Calendar, Users, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorDashboard({ children, doctorInfo }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const avatarUrl = doctorInfo?.avatar || doctorInfo?.image || doctorInfo?.profileImage;
  const doctorName = doctorInfo?.name || doctorInfo?.fullName || 'Doctor';
  const firstLetter = doctorName.charAt(0).toUpperCase();

  const navigationItems = [
    { 
      title: "Lịch làm việc", 
      url: "/doctor/schedule", 
      icon: Calendar
    },
    { 
      title: "Hồ sơ khám", 
      url: "/doctor/exam-records", 
      icon: Users
    },
    { 
      title: "Tạo hồ sơ khám", 
      url: "/doctor/create-records", 
      icon: FileText
    },
    { 
      title: "Xem đánh giá", 
      url: "/doctor/view-feedback", 
      icon: FileType
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
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
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={doctorName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-green-800 font-bold text-sm">${firstLetter}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-green-800 font-bold text-sm">
                    {firstLetter}
                  </span>
                )}
              </div>
              <div className="text-center mt-2">
                <div className="font-semibold">{doctorName}</div>
                <div className="text-sm text-green-200">Bác sĩ</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white w-full"
            >
              Đăng xuất
            </Button>
          </SidebarFooter>
        </Sidebar>


        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-16 items-center border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="ml-4 text-lg font-semibold text-gray-700">
              
            </h1>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
