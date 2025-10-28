import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { FaSearch, FaUser, FaHistory, FaExpandAlt } from "react-icons/fa";

const API_ENDPOINTS = {
  SEARCH_PATIENTS: "http://localhost:1118/api/medical-records/search",
};


const getServicesFromOrderDetails = (orderDetailsString) => {
    if (!orderDetailsString) return [];
    try {
        const services = JSON.parse(orderDetailsString);
        return Array.isArray(services) ? services : [];
    } catch (error) {
        return [];
    }
};

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPatientId, setExpandedPatientId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPatients = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setExpandedPatientId(null);

    try {
      const response = await axios.get(
        `${API_ENDPOINTS.SEARCH_PATIENTS}?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
            toast.success("Không tìm thấy bệnh nhân nào khớp với từ khóa.");
        }
      } else {
        toast.error(response.data.message || "Lỗi khi tìm kiếm bệnh nhân.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Lỗi kết nối hoặc lỗi server khi tìm kiếm.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };
  const toggleMedicalRecords = (patientId) => {
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
  };
  
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString).format('DD/MM/YYYY') : 'N/A';
  };
  
  const formatTime = (timeString) => {
    return timeString ? timeString.substring(0, 5) : 'N/A';
  };
  
  const formatCurrency = (amount) => {
    return amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' VND' : 'N/A';
  };


  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <FaUser className="mr-3 text-blue-600" /> Quản lý Hồ sơ Bệnh nhân
      </h1>

      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <input
            type="text"
            placeholder="Nhập Tên, SĐT, hoặc Mã định danh để tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 text-gray-700 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 text-white transition-colors flex items-center ${
              loading || !searchTerm
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span>Đang tìm...</span>
            ) : (
              <><FaSearch className="mr-2" /> Tìm kiếm</>
            )}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Kết quả ({searchResults.length} bệnh nhân)
      </h2>
      
      {searchResults.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-10 border border-dashed rounded-lg">
            {!searchTerm 
                ? "Vui lòng nhập từ khóa để bắt đầu tìm kiếm bệnh nhân."
                : "Không tìm thấy hồ sơ bệnh nhân nào khớp với từ khóa đã nhập."
            }
        </div>
      )}

      {searchResults.map((patient) => (
        <div key={patient.id} className="mb-6 p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6 text-sm">
            <p><strong><FaUser className="inline mr-2 text-blue-500"/>Tên:</strong> {patient.name}</p>
            <p><strong>SĐT:</strong> {patient.phoneNumber}</p>
            <p><strong>Ngày sinh:</strong> {formatDate(patient.dateOfBirth)} ({patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'})</p>
            <p className="md:col-span-3"><strong>Email:</strong> {patient.email}</p>
          </div>
          
          <hr className="my-3" />

          <button
            onClick={() => toggleMedicalRecords(patient.id)}
            className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaHistory className="mr-2" /> 
            {patient.MedicalRecords?.length || 0} Hồ sơ Bệnh án đã khám ({patient.MedicalRecords?.length ? 'Bấm để ' : ''} {expandedPatientId === patient.id ? "Ẩn Chi Tiết" : "Xem Chi Tiết"})
            <FaExpandAlt className={`ml-2 transform transition-transform ${expandedPatientId === patient.id ? 'rotate-90' : 'rotate-0'}`} size={12}/>
          </button>

          {expandedPatientId === patient.id && (
            <div className="mt-4 space-y-4">
              {patient.MedicalRecords?.length > 0 ? (
                patient.MedicalRecords.map((record, index) => {
                  const services = getServicesFromOrderDetails(record.orderDetails);
                  const totalAmount = services.reduce((sum, s) => sum + (s.total || 0), 0);
                  
                  return (
                    <div key={record.id} className="border border-green-300 rounded-lg p-4 bg-white shadow-md">
                      <h4 className="font-bold text-green-700 mb-2">Lần khám #{index + 1} - Ngày: {formatDate(record.Appointment.date)}</h4>
                      
                      <div className="grid grid-cols-2 text-sm mb-3 border-b pb-2">
                        <p><strong>Bác sĩ:</strong> {record.Employee.name}</p>
                        <p><strong>Trạng thái LH:</strong> <span className="font-medium text-purple-600">{record.Appointment.status.toUpperCase()}</span></p>
                        <p><strong>Thời gian:</strong> {formatTime(record.Appointment.startTime)} - {formatTime(record.Appointment.endTime)}</p>
                        <p><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
                        <p className="col-span-2"><strong>Điều trị:</strong> {record.treatment}</p>
                      </div>

                      <p className="font-semibold text-sm text-green-600 mb-2">Dịch vụ đã sử dụng:</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-green-100 border border-green-200">
                          <thead className="bg-green-50">
                            <tr>
                              <th className="px-3 py-1 text-xs font-medium text-green-700">Tên Dịch vụ</th>
                              <th className="px-3 py-1 text-xs font-medium text-green-700">SL</th>
                              <th className="px-3 py-1 text-xs font-medium text-green-700 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-green-100">
                            {services.map((s, sIndex) => (
                              <tr key={sIndex}>
                                <td className="px-3 py-1 whitespace-nowrap text-sm">{s.name}</td>
                                <td className="px-3 py-1 whitespace-nowrap text-sm text-center">{s.quantity}</td>
                                <td className="px-3 py-1 whitespace-nowrap text-sm font-semibold text-right">{formatCurrency(s.total)}</td>
                              </tr>
                            ))}
                            <tr>
                                <td colSpan="2" className="px-3 py-1 text-sm font-bold text-right">TỔNG CỘNG:</td>
                                <td className="px-3 py-1 whitespace-nowrap text-sm font-extrabold text-right text-red-600">{formatCurrency(totalAmount)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 italic p-3 bg-white rounded-md border">
                    Chưa có hồ sơ bệnh án nào được tạo cho bệnh nhân này.
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}