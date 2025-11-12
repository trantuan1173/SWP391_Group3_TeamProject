import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config';
import DoctorLayout from "../../components/doctor/DoctorDashboard";

const ViewExamRecord = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeMenu, setActiveMenu] = useState('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  const normalizedSearchTerm = searchTerm.replace(/\s+/g, ' ').trim().toLowerCase();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);


  useEffect(() => {
    if (currentUserId) {
      fetchPatients(currentUserId, localStorage.getItem("token"));
    }
  }, [startDate, endDate]);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

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
      await fetchPatients(userId, token);
    } catch (error) {
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
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        API_ENDPOINTS.GET_PATIENTS_BY_DOCTOR(doctorId),
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const patientsData = response.data.data || response.data || [];
      setPatients(patientsData);
    } catch (error) {
      setError(`Không thể tải danh sách bệnh nhân: ${error.response?.data?.error || error.message}`);
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleViewDetail = (patientId) => {
    navigate(`/doctor/exam-records/${patientId}`);
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = normalizedSearchTerm.toLowerCase();
    return (
      (patient.name?.toLowerCase().replace(/\s+/g, ' ').includes(searchLower)) ||
      (patient.phoneNumber?.includes(searchTerm)) ||
      (patient.email?.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h4 className="text-2xl font-semibold text-gray-800">
            Danh Sách Bệnh Nhân ({patients.length})
          </h4>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 mt-4 space-y-2 md:space-y-0">

            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân..."
              className="px-4 py-2 border rounded-lg w-full md:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <button
                className="bg-green-500 text-white px-4 py-1 rounded"
                onClick={() => fetchPatients(currentUserId, localStorage.getItem("token"))}
              >
                Lọc
              </button>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {patients.length === 0 
                ? "Chưa có bệnh nhân nào" 
                : "Không tìm thấy bệnh nhân phù hợp"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedPatients.map((patient, index) => {
                  const patientId = patient.patientId || patient.id;
                  const patientName = patient.patientName || patient.name;
                  const patientPhone = patient.patientPhone || patient.phoneNumber;
                  const patientEmail = patient.patientEmail || patient.email;
                  const patientGender = patient.patientGender || patient.gender;
                  const patientDOB = patient.patientDOB || patient.dateOfBirth;
                  return (
                    <div
                      key={patientId || index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-800 text-lg">
                            {patientName || 'Không có tên'}
                          </div>
                          <div className="text-sm text-gray-600">
                            📞 {patientPhone || 'Chưa có SĐT'}
                          </div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {patientGender || 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <div>
                          <strong>Ngày sinh:</strong> {formatDateOnly(patientDOB)}
                        </div>
                        <div>
                          <strong>Email:</strong> {patientEmail || 'Chưa có'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetail(patientId)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Xem Hồ Sơ Khám
                      </button>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default ViewExamRecord;
