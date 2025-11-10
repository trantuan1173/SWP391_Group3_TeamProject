import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import DoctorLayout from "../../components/doctor/DoctorDashboard";

const MedicalRecordDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [activeMenu, setActiveMenu] = useState('patients');

  useEffect(() => {
    checkAuthAndFetchData();
  }, [patientId]);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload.userId || payload.sub;

      const response = await axios.get(
        API_ENDPOINTS.GET_EMPLOYEE_WITH_ROLE(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.isDoctor) {
        alert("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }

      setDoctorInfo(response.data);
      await fetchMedicalRecords(userId, token);
    } catch (error) {
      console.error("Auth check error:", error);
      setError("Có lỗi xảy ra khi kiểm tra quyền truy cập");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async (doctorId, token) => {
    try {
      // Get patient info
      const patientRes = await axios.get(
        API_ENDPOINTS.PATIENT_BY_ID(patientId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatientInfo(patientRes.data.data);

      // Get medical records
      const recordsRes = await axios.get(
        API_ENDPOINTS.GET_MEDICAL_RECORDS_BY_DOCTOR(doctorId, patientId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedicalRecords(recordsRes.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải hồ sơ khám bệnh.");
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Đang tải...</div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-red-500">Lỗi: {error}</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
      <div className="p-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/doctor/exam-records')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách bệnh nhân
        </button>

        {/* Patient Info Card */}
        {patientInfo && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông Tin Bệnh Nhân</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Họ tên:</span>
                <span className="ml-2 font-semibold text-green-600">{patientInfo.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Ngày sinh:</span>
                <span className="ml-2">{formatDateOnly(patientInfo.dateOfBirth)}</span>
              </div>
              <div>
                <span className="text-gray-600">Giới tính:</span>
                <span className="ml-2">{patientInfo.gender === 'male' ? 'Nam' : 'Nữ'}</span>
              </div>
              <div>
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="ml-2">{patientInfo.phoneNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2">{patientInfo.email || 'Chưa có'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Medical Records */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Lịch Sử Khám Bệnh
          </h2>
          
          {medicalRecords.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Chưa có hồ sơ khám nào</div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-gray-800">
                      Ngày khám: {formatDateOnly(record.appointment?.date)}
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {record.appointment?.status === 'completed' ? 'Hoàn thành' : 
                       record.appointment?.status === 'confirmed' ? 'Đã xác nhận' : 
                       'Hoàn thành'}
                    </span>
                  </div>
                  
                  {record.appointment?.startTime && (
                    <div className="text-xs text-gray-500 mb-2">
                      ⏰ Giờ khám: {record.appointment.startTime} - {record.appointment.endTime}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Triệu chứng:</strong> {record.symptoms || 'Không có'}</div>
                    <div><strong>Chẩn đoán:</strong> {record.diagnosis || 'Không có'}</div>
                    <div><strong>Điều trị:</strong> {record.treatment || 'Không có'}</div>
                  </div>
                  
                  {selectedRecord?.id === record.id && record.orderDetails && record.orderDetails.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="font-semibold text-gray-700 mb-2">Dịch vụ đã sử dụng:</div>
                      <div className="space-y-2">
                        {record.orderDetails.map((service, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{service.name} x{service.quantity}</span>
                            <span className="font-semibold">{service.total?.toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-300 flex justify-between font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-green-600">
                            {record.orderDetails.reduce((sum, s) => sum + (s.total || 0), 0).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default MedicalRecordDetail;
