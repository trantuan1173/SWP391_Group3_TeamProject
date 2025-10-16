// frontend/src/page/doctor/CreateMedicalRecord.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from "../../components/doctor/DoctorDashboard";
import { API_ENDPOINTS } from '../../config';

const CreateMedicalRecord = () => {
  const [patientsWithAppointments, setPatientsWithAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [activeMenu, setActiveMenu] = useState('create-record');
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

      // Decode JWT
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload.userId || payload.sub;

      console.log("User ID:", userId); // Debug

      // Kiểm tra role
      const response = await axios.get(
        API_ENDPOINTS.GET_EMPLOYEE_WITH_ROLE(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Doctor info:", response.data); // Debug

      if (!response.data.isDoctor) {
        alert("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }
      setDoctorInfo(response.data);

      // Lấy danh sách bệnh nhân
      const patientsRes = await axios.get(
        API_ENDPOINTS.GET_PATIENT_BY_DOCTOR(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Patients response:", patientsRes.data); // Debug

      const patientsList = patientsRes.data.data || [];
      console.log("Patients list:", patientsList); // Debug

      setPatientsWithAppointments(patientsList);

      // Lấy danh sách dịch vụ
      const servicesRes = await axios.get(
        API_ENDPOINTS.GET_SERVICES,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices(servicesRes.data.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.response?.data); // Debug
      setError(error.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId, quantity) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const existingIndex = selectedServices.findIndex(s => s.serviceId === serviceId);
    
    if (quantity === 0) {
      setSelectedServices(selectedServices.filter(s => s.serviceId !== serviceId));
    } else if (existingIndex >= 0) {
      const updated = [...selectedServices];
      updated[existingIndex] = {
        serviceId,
        quantity,
        total: service.price * quantity
      };
      setSelectedServices(updated);
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId,
          quantity,
          total: service.price * quantity
        }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      alert("Vui lòng chọn bệnh nhân!");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ!");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const payload = {
        appointmentId: selectedPatient.appointmentId,
        patientId: selectedPatient.patientId,
        doctorId: doctorInfo.id,
        symptoms,
        diagnosis,
        treatment,
        services: selectedServices
      };

      console.log("Submitting payload:", payload);

      await axios.post(
        API_ENDPOINTS.CREATE_MEDICAL_RECORD,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Tạo hồ sơ khám bệnh thành công!");
      navigate("/doctor/exam-records");
    } catch (error) {
      console.error("Error creating medical record:", error);
      alert(error.response?.data?.error || "Không thể tạo hồ sơ khám bệnh.");
    } finally {
      setLoading(false);
    }
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

  return (
    <DoctorLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} doctorInfo={doctorInfo}>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow mt-8">
        <h1 className="text-3xl font-bold mb-6 text-green-700">Tạo Hồ Sơ Khám Bệnh</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chọn bệnh nhân */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block font-semibold mb-3 text-lg">
              1. Chọn bệnh nhân <span className="text-red-500">*</span>
            </label>
            
            {patientsWithAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Không có lịch hẹn nào</p>
                <p className="text-sm mt-2">Vui lòng kiểm tra lại lịch hẹn của bạn</p>
              </div>
            ) : (
              <>
                <select
                  className="w-full border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                  value={selectedPatient?.appointmentId || ''}
                  onChange={e => {
                    const patient = patientsWithAppointments.find(
                      p => p.appointmentId === Number(e.target.value)
                    );
                    console.log("Selected patient:", patient); // Debug
                    setSelectedPatient(patient);
                  }}
                  required
                >
                  <option value="">-- Chọn bệnh nhân --</option>
                  {patientsWithAppointments.map(patient => (
                    <option key={patient.appointmentId} value={patient.appointmentId}>
                      {patient.patientName} - {patient.appointmentDate} ({patient.appointmentTime})
                    </option>
                  ))}
                </select>
                
                {selectedPatient && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                    <p className="text-sm"><strong>Họ tên:</strong> {selectedPatient.patientName}</p>
                    <p className="text-sm"><strong>SĐT:</strong> {selectedPatient.patientPhone}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedPatient.patientEmail}</p>
                    <p className="text-sm"><strong>Giới tính:</strong> {selectedPatient.patientGender}</p>
                    <p className="text-sm"><strong>Ngày sinh:</strong> {
                      selectedPatient.patientDOB ? 
                      new Date(selectedPatient.patientDOB).toLocaleDateString('vi-VN') : 
                      'N/A'
                    }</p>
                    <p className="text-sm"><strong>Ngày khám:</strong> {selectedPatient.appointmentDate}</p>
                    <p className="text-sm"><strong>Giờ khám:</strong> {selectedPatient.appointmentTime}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Các phần còn lại giữ nguyên */}
          <div>
            <label className="block font-semibold mb-2 text-lg">
              2. Triệu chứng <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={3}
              placeholder="Nhập triệu chứng của bệnh nhân..."
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-lg">
              3. Chẩn đoán <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              rows={3}
              placeholder="Nhập chẩn đoán bệnh..."
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-lg">
              4. Phương pháp điều trị <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              rows={3}
              placeholder="Nhập phương pháp điều trị..."
              required
            />
          </div>

          {/* Phần chọn dịch vụ giữ nguyên */}
          <div className="bg-green-50 p-4 rounded-lg">
            <label className="block font-semibold mb-3 text-lg">
              5. Chọn dịch vụ <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {services.map(service => {
                const selected = selectedServices.find(s => s.serviceId === service.id);
                return (
                  <div key={service.id} className="flex items-center gap-4 p-3 bg-white rounded border hover:border-green-400">
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={e => {
                        if (e.target.checked) {
                          handleServiceChange(service.id, 1);
                        } else {
                          handleServiceChange(service.id, 0);
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-600">{service.description}</p>
                      )}
                      <p className="text-green-600 font-semibold">
                        {service.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold">Số lượng:</label>
                        <input
                          type="number"
                          min="1"
                          value={selected.quantity}
                          onChange={e => handleServiceChange(service.id, Number(e.target.value))}
                          className="w-20 border-2 rounded px-2 py-1 text-center"
                        />
                        <span className="text-sm font-semibold text-green-600">
                          = {selected.total.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border-2 border-green-400">
                <p className="font-semibold text-lg">Tổng chi phí dịch vụ:</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedServices.reduce((sum, s) => sum + s.total, 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || patientsWithAppointments.length === 0}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Đang xử lý...' : 'Tạo hồ sơ khám bệnh'}
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctor/exam-records")}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
};

export default CreateMedicalRecord;
