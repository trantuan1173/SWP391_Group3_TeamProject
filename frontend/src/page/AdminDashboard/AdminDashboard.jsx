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
import {
  fetchTotalPatients,
  fetchActivePatients,
  fetchTotalEmployees,
  fetchAvailableRoles,
  fetchRecentPatients,
  fetchRecentEmployees,
} from "@/api/dashboardApi";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    totalEmployees: 0,
    totalRoles: 0,
    roleNames: [],
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [patients, active, employees, roles, recentP, recentE] =
          await Promise.all([
            fetchTotalPatients(),
            fetchActivePatients(),
            fetchTotalEmployees(),
            fetchAvailableRoles(),
            fetchRecentPatients(),
            fetchRecentEmployees(),
          ]);

        setStats({
          totalPatients: patients.total || 0,
          activePatients: active.active || 0,
          totalEmployees: employees.total || 0,
          totalRoles: roles.total || 0,
          roleNames: roles.roles || [],
        });

        setRecentPatients(recentP || []);
        setRecentEmployees(recentE || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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
          <h2 className="!text-3xl !font-bold">Welcome!</h2>
          <div className="flex gap-2">
            <Button
              asChild
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Link className="text-decoration-none" to="/admin/user">
                Go to Employee
              </Link>
            </Button>
            <Button
              asChild
              className="bg-green-500 text-white hover:bg-green-700"
            >
              <Link className="text-decoration-none" to="/admin/patients">
                Go to Patients
              </Link>
            </Button>
          </div>
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
              <p className="text-xs text-gray-500 mt-1">Updated recently</p>
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
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalPatients > 0
                  ? `${Math.round(
                      (stats.activePatients / stats.totalPatients) * 100
                    )}% currently active`
                  : "No data"}
              </p>
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
              <p className="text-xs text-gray-500 mt-1">Latest staff count</p>
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
                {stats.roleNames.length > 0
                  ? stats.roleNames.join(", ")
                  : "No roles found"}
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
              <Button asChild variant="link" className="text-blue-600">
                <Link
                  className="text-decoration-none hover:!underline"
                  to="/admin/patients"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.length > 0 ? (
                  recentPatients.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={p.name} />
                          <AvatarFallback>
                            {p.name?.charAt(0).toUpperCase()}
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
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center">
                    No recent patients found
                  </p>
                )}
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
                <Link
                  className="text-decoration-none hover:!underline"
                  to="/admin/user"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmployees.length > 0 ? (
                  recentEmployees.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={e.name} />
                          <AvatarFallback>
                            {e.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{e.name}</p>
                          <p className="text-sm text-gray-500">{e.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                        {e.role || "Unknown"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center">
                    No recent employees found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
