import React, { useEffect, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Users,
  UserPlus,
  Shield,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 124,
    activePatients: 98,
    totalEmployees: 20,
    totalRoles: 4,
  });

  const [recentPatients, setRecentPatients] = useState([
    {
      id: 1,
      name: "Nguyen Van A",
      email: "vana@example.com",
      gender: "Male",
      isActive: true,
    },
    {
      id: 2,
      name: "Tran Thi B",
      email: "thib@example.com",
      gender: "Female",
      isActive: false,
    },
    {
      id: 3,
      name: "Le Van C",
      email: "le.c@example.com",
      gender: "Male",
      isActive: true,
    },
  ]);

  const [recentEmployees, setRecentEmployees] = useState([
    {
      id: 1,
      name: "Dr. Pham Minh",
      email: "minh.pham@example.com",
      role: "Doctor",
    },
    {
      id: 2,
      name: "Le Hoa",
      email: "hoa.le@example.com",
      role: "Receptionist",
    },
    {
      id: 3,
      name: "Admin Nguyen",
      email: "admin@example.com",
      role: "Admin",
    },
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-gray-500 text-lg">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Welcome!</h2>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link to="/admin/patients">Go to Management</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-gray-500 mt-1">+5 since last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Patients
              </CardTitle>
              <UserPlus className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatients}</div>
              <p className="text-xs text-gray-500 mt-1">78% currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Shield className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-gray-500 mt-1">
                +2 new hires this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Available Roles
              </CardTitle>
              <ClipboardList className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoles}</div>
              <p className="text-xs text-gray-500 mt-1">
                Doctor, Nurse, Admin, Staff
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <Card className="shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Patients</CardTitle>
              <Button
                asChild
                variant="link"
                className="text-blue-600 hover:underline"
              >
                <Link to="/admin/patients">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={p.name} />
                        <AvatarFallback>
                          {p.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-gray-500">{p.email}</p>
                      </div>
                    </div>
                    <Badge
                      variant={p.isActive ? "default" : "secondary"}
                      className={`${
                        p.isActive
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-400"
                      } text-white`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Employees */}
          <Card className="shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Employees</CardTitle>
              <Button
                asChild
                variant="link"
                className="text-blue-600 hover:underline"
              >
                <Link to="/admin/user">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmployees.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={e.name} />
                        <AvatarFallback>
                          {e.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{e.name}</p>
                        <p className="text-sm text-gray-500">{e.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                      {e.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
