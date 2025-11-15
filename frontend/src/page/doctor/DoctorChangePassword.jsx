import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function DoctorChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (form.newPassword !== form.confirmNewPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(API_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        setSuccessMessage("Đổi mật khẩu thành công!");
        setTimeout(() => navigate("/doctor/schedule"), 2000);
      }
    } catch (error) {
      if (error.response) {
        const message = error.response.data.error || "Đổi mật khẩu thất bại.";
        setErrorMessage(message);
      } else {
        setErrorMessage("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Đổi mật khẩu</h2>
        {errorMessage && (
          <div className="text-red-600 font-semibold text-sm text-center mb-4">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 font-semibold text-sm text-center mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu hiện tại
            </label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              required
              value={form.currentPassword}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu mới
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              required
              value={form.newPassword}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmNewPassword"
              required
              value={form.confirmNewPassword}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/doctor/schedule")}
            className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 mt-2"
          >
            Hủy
          </Button>
        </form>
      </div>
    </div>
  );
}
