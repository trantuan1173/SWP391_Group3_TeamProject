import AdminLayout from "@/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function AdminProfile() {
  const { user, logout } = useAuth();
  console.log("User info:", user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Gọi API cập nhật thông tin user ở đây
    console.log("Lưu thông tin:", formData);
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
        {/* Cột trái: avatar + nút hành động */}
        <Card className="w-full md:w-1/3 shadow-md border-green-100">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center text-green-700 text-3xl font-bold">
              {user?.avatar && (
                <img
                  src={
                    user.avatar.startsWith("http")
                      ? user.avatar
                      : `${import.meta.env.VITE_API_URL}${user.avatar}`
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <CardTitle className="text-xl font-semibold">
              {user?.name || "Unknown"}
            </CardTitle>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {user?.roles[0].name || "User"}
            </span>
          </CardHeader>

          <Separator />

          <CardContent className="flex flex-col gap-2">
            <Button
              variant={"outline"}
              onClick={() => setIsEditing(!isEditing)}
              className="w-full !rounded-2xl"
            >
              {isEditing ? "Hủy chỉnh sửa" : "Sửa thông tin"}
            </Button>
            <Button className="w-full !rounded-2xl">Đổi mật khẩu</Button>
            <Button
              onClick={logout}
              className="w-full !rounded-2xl"
              variant="destructive"
            >
              Đăng xuất
            </Button>
          </CardContent>
        </Card>

        {/* Cột phải: thông tin chi tiết */}
        <Card className="w-full md:w-2/3 shadow-md border-green-100">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Họ và tên</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Số điện thoại</label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Giới tính</label>
                <Input
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Địa chỉ</label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSave}
                  className="bg-green-500 text-white"
                >
                  💾 Lưu thay đổi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
