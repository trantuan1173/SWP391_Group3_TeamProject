import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/layout/AdminLayout";
import { fetchPatientById } from "@/api/patientApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function PatientDetailManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await fetchPatientById(id);
        setPatient(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bệnh nhân:", error);
      }
    };
    loadPatient();
  }, [id]);

  if (!patient) {
    return (
      <AdminLayout>
        <p className="text-center py-10">Đang tải dữ liệu...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 rounded-md h-full">
        {/* Nút quay lại */}
        <Button
          className="!mb-6 !rounded-md"
          onClick={() => navigate("/admin/patients")}
        >
          Quay lại danh sách bệnh nhân
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Avatar & Thông tin cơ bản */}
          <Card className="col-span-1 flex flex-col items-center p-6">
            <Avatar className="w-40 h-40">
              <AvatarImage
                src={`http://localhost:1118${patient.avatar || ""}`}
                alt={patient.name}
              />
              <AvatarFallback>
                {patient.name?.charAt(0).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>

            <p className="text-lg font-bold mb-0 mt-3">{patient.name}</p>

            <div
              className={`px-4 py-2 rounded-full mt-2 text-sm font-bold ${
                patient.isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-400 text-white"
              }`}
            >
              {patient.isActive ? "ĐANG HOẠT ĐỘNG" : "TẠM KHÓA"}
            </div>
          </Card>

          {/* Thông tin chi tiết */}
          <Card className="col-span-3 p-10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid p-3 grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-gray-600">Họ và tên</p>
                  <p>{patient.name || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p>{patient.email || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Số CCCD / CMND</p>
                  <p>{patient.identityNumber || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Số điện thoại</p>
                  <p>{patient.phoneNumber || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Địa chỉ</p>
                  <p>{patient.address || "-"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Ngày sinh</p>
                  <p>
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Giới tính</p>
                  <p className="capitalize">
                    {patient.gender === "male"
                      ? "Nam"
                      : patient.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">
                    Ngày tạo tài khoản
                  </p>
                  <p>
                    {new Date(patient.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Ngày cập nhật</p>
                  <p>
                    {new Date(patient.updatedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
