import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config';
import DoctorLayout from "../../components/doctor/DoctorDashboard";

const ViewExamRecord = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Decode JWT để lấy userId
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload.userId || payload.sub;
      setCurrentUserId(userId);

      if (!userId) {
        navigate("/login");
        return;
      }

      // Kiểm tra role của user
      const response = await axios.get(
        API_ENDPOINTS.GET_EMPLOYEE_WITH_ROLE(userId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.isDoctor) {
        alert("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }

      setDoctorInfo(response.data);
      await fetchPatients(userId, token);
    } catch (error) {
      console.error("Auth check error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (doctorId, token) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.GET_PATIENTS_BY_DOCTOR(doctorId),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPatients(response.data.data || []);
    } catch (error) {
      console.error("Fetch patients error:", error);
      setError("Không thể tải danh sách bệnh nhân.");
    }
  };

  const fetchMedicalRecords = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        API_ENDPOINTS.GET_MEDICAL_RECORDS_BY_DOCTOR(currentUserId, patientId),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMedicalRecords(response.data.data || []);
    } catch (error) {
      console.error("Fetch medical records error:", error);
      setError("Không thể tải hồ sơ khám bệnh.");
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSelectedRecord(null);
    fetchMedicalRecords(patient.id);
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
  };

  // Hàm format ngày chỉ lấy ngày/tháng/năm, bỏ giờ phút giây
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Tạo Date object từ string
    const date = new Date(dateString);
    
    // Lấy ngày, tháng, năm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber?.includes(searchTerm)
  );

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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-white/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-gray-700 font-semibold">Xin chào, {doctorInfo?.name || 'Bác Sĩ'}</div>
          </div>
          <div className="text-sm text-gray-500">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Lịch Sử Khám Bệnh</h1>
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân..."
              className="px-4 py-2 border rounded-lg w-80 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Danh sách bệnh nhân */}
            <div className="col-span-4 bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Bệnh Nhân Đã Khám</h2>
              {filteredPatients.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Không có bệnh nhân nào</div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        selectedPatient?.id === patient.id
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-white hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{patient.name}</div>
                      <div className="text-sm text-gray-600">📞 {patient.phoneNumber}</div>
                      <div className="text-xs text-gray-500">
                        {patient.gender === 'male' ? '👨' : '👩'} {formatDateOnly(patient.dateOfBirth)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danh sách hồ sơ khám */}
            <div className="col-span-8">
              {!selectedPatient ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg">Chọn bệnh nhân để xem lịch sử khám</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Hồ Sơ Khám Của: <span className="text-green-600">{selectedPatient.name}</span>
                  </h2>
                  {medicalRecords.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Chưa có hồ sơ khám nào</div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {medicalRecords.map((record) => (
                        <div
                          key={record.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                          onClick={() => handleRecordSelect(record)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800">
                              {/* SỬA LẠI ĐÂY - Lấy từ record.appointment.date */}
                              Ngày khám: {formatDateOnly(record.appointment?.date)}
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {record.appointment?.status === 'completed' ? 'Hoàn thành' : 
                               record.appointment?.status === 'confirmed' ? 'Đã xác nhận' : 
                               record.appointment?.status || 'Hoàn thành'}
                            </span>
                          </div>
                          
                          {/* Thêm thời gian khám */}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default ViewExamRecord;
