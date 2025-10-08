import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layout/AdminLayout";
import { fetchUserById } from "@/api/userApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserDetailManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserById(id);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    loadUser();
  }, [id]);

  if (!user) {
    return (
      <AdminLayout>
        <p className="text-center py-10">Loading...</p>
      </AdminLayout>
    );
  }

  const getRoleStyles = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white"; // admin: đỏ
      case "patient":
        return "bg-blue-500 text-white"; // user: xanh dương
      case "doctor":
        return "bg-green-500 text-white"; // manager: xanh lá
      default:
        return "bg-gray-400 text-white"; // mặc định: xám
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 rounded-md h-full">
        {/* Nút Back */}
        <Button
          className="!mb-6 !rounded-md"
          onClick={() => navigate("/admin/user")}
        >
          Back To Home
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Avatar Card */}
          <Card className="col-span-1 flex flex-col items-center p-6">
            <Avatar className="w-40 h-40">
              <AvatarImage
                src={`http://localhost:1118${user.avatar}`}
                alt={user.name}
              />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <p className="text-lg font-bold mb-0">{user.name}</p>

            <div
              className={`px-4 py-2 rounded-full mt-2 ${getRoleStyles(
                user.Roles[0].name
              )}`}
            >
              <p className="text-sm m-0 font-bold">
                {" "}
                {user.Roles?.[0]?.name.toUpperCase() || "No role"}
              </p>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="col-span-3 p-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {user.name} Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid p-3 grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">Name</p>
                  <p>{user.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="font-medium">Identity Number</p>
                  <p>{user.identityNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p>{user.phoneNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Date of Birth</p>
                  <p>{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Gender</p>
                  <p>{user.gender}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
