import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const DoctorSchedule = () => {
  const { doctorId } = useParams();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`/api/doctors/${doctorId}/schedules`);
        setSchedules(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSchedules();
  }, [doctorId]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
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
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-800 font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-green-200">{user.role}</span>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  className="text-white !rounded-md !text-sm bg-red-400 hover:!bg-red-500"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="text-white text-sm">Not logged in</div>
            )}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
          </header>

          <main className="flex-1 p-4 bg-gray-50">
            <h2 className="text-xl font-bold mb-4">Lịch khám của bác sĩ</h2>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Ngày</th>
                  <th className="border px-4 py-2">Giờ bắt đầu</th>
                  <th className="border px-4 py-2">Giờ kết thúc</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="border px-4 py-2">{schedule.date}</td>
                    <td className="border px-4 py-2">{schedule.startTime}</td>
                    <td className="border px-4 py-2">{schedule.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DoctorSchedule;
