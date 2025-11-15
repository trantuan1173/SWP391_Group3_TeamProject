import AdminLayout from "@/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

// 👉 TẠO axios instance, tự gắn Authorization từ localStorage
const api = axios.create({
  baseURL: "http://localhost:1118/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ĐỔI "token" nếu bạn dùng key khác
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AdminProfile() {
  const { user, logout } = useAuth();
  console.log("User info:", user);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await api.put("/users/change-profile-info", {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        address: formData.address,
      });

      alert(res.data?.message || "Cập nhật thông tin thành công");
      setIsEditing(false);

      window.location.reload();
    } catch (err) {
      console.error("handleSave error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Cập nhật thông tin thất bại";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ các trường mật khẩu");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await api.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      alert(res.data?.message || "Đổi mật khẩu thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (err) {
      console.error("handleChangePasswordSubmit error:", err);
      const msg =
        err?.response?.data?.error || err?.message || "Đổi mật khẩu thất bại";
      alert(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
        <Card className="w-full md:w-1/3 shadow-md border-green-100">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center text-green-700 text-3xl font-bold">
              {user?.avatar ? (
                <img
                  src={
                    user.avatar.startsWith("http")
                      ? user.avatar
                      : `http://localhost:1118${user.avatar}`
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
              )}
            </div>
            <CardTitle className="text-xl font-semibold">
              {user?.name || "Unknown"}
            </CardTitle>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {user?.roles?.[0]?.name || "User"}
            </span>
          </CardHeader>

          <Separator />

          <CardContent className="flex flex-col gap-2">
            <Button
              variant={"outline"}
              onClick={() => setIsEditing((prev) => !prev)}
              className="w-full !rounded-2xl"
            >
              {isEditing ? "Hủy chỉnh sửa" : "Sửa thông tin"}
            </Button>

            <Button
              className="w-full !rounded-2xl"
              variant={isChangingPassword ? "outline" : "default"}
              onClick={() => setIsChangingPassword((prev) => !prev)}
            >
              {isChangingPassword ? "Hủy đổi mật khẩu" : "Đổi mật khẩu"}
            </Button>

            <Button
              onClick={logout}
              className="w-full !rounded-2xl"
              variant="destructive"
            >
              Đăng xuất
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3 shadow-md border-green-100">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Form thông tin cá nhân */}
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
              <div className="flex justify-end mt-6 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-500 text-white"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            )}

            {/* Form đổi mật khẩu */}
            {isChangingPassword && (
              <div className="mt-10 border-t pt-6">
                <h3 className="text-md font-semibold mb-4">Đổi mật khẩu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">
                      Mật khẩu hiện tại
                    </label>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Mật khẩu mới
                    </label>
                    <Input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    disabled={changingPassword}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleChangePasswordSubmit}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
