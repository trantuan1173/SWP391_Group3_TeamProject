// frontend/src/page/doctor/CreateMedicalRecord.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorDashboard";
import { API_ENDPOINTS } from "../../config";

const CreateMedicalRecord = () => {
  const [patientsWithAppointments, setPatientsWithAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [medicines, setMedicines] = useState([]); // << thêm
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]); // << thêm
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [activeMenu, setActiveMenu] = useState("create-record");
  const [searchService, setSearchService] = useState("");
  const [searchMedicine, setSearchMedicine] = useState(""); // << thêm

  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId } = location.state || {};

  useEffect(() => {
    checkAuthAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Decode JWT (lấy userId)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      const payload = JSON.parse(atob(tokenParts[1]));
      const userId = payload.id || payload.userId || payload.sub;

      // Kiểm tra role
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
      console.log("Doctor info:", response.data);

      // Lấy danh sách bệnh nhân (theo lịch khám)
      const patientsRes = await axios.get(
        API_ENDPOINTS.GET_PATIENT_BY_DOCTOR(userId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const patientsList = patientsRes.data.data || [];
      setPatientsWithAppointments(patientsList);

      if (appointmentId && patientsList.length > 0) {
        const matchedPatient = patientsList.find(
          (p) => p.appointmentId === Number(appointmentId)
        );
        if (matchedPatient) setSelectedPatient(matchedPatient);
      }

      // Lấy danh sách dịch vụ
      const servicesRes = await axios.get(API_ENDPOINTS.GET_SERVICES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(servicesRes.data.data || []);

      // Lấy danh sách thuốc  << thêm
      const medsRes = await axios.get(API_ENDPOINTS.GET_MEDICINES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // API có thể trả { medicines } hoặc { data }
      setMedicines(medsRes.data.medicines || medsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // ====== Chọn dịch vụ ======
  const handleServiceChange = (serviceId, quantity) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const existingIndex = selectedServices.findIndex(
      (s) => s.serviceId === serviceId
    );

    if (quantity === 0) {
      setSelectedServices(
        selectedServices.filter((s) => s.serviceId !== serviceId)
      );
    } else if (existingIndex >= 0) {
      const updated = [...selectedServices];
      updated[existingIndex] = {
        serviceId,
        quantity,
        total: Number(service.price || 0) * quantity,
      };
      setSelectedServices(updated);
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId,
          quantity,
          total: Number(service.price || 0) * quantity,
        },
      ]);
    }
  };

  // ====== Chọn thuốc (toggle)  << thêm ======
  const handleMedicineToggle = (medicineId, checked) => {
    const m = medicines.find((md) => md.id === medicineId);
    if (!m) return;

    if (!checked) {
      setSelectedMedicines((prev) =>
        prev.filter((x) => x.medicineId !== medicineId)
      );
    } else {
      setSelectedMedicines((prev) => [
        ...prev,
        {
          medicineId,
          quantity: 1,
          dose: "",
          frequency: "",
          duration: "",
          route: m.route || "",
          instructions: "",
          total: Number(m.price || 0) * 1,
        },
      ]);
    }
  };

  // ====== Cập nhật field của thuốc  << thêm ======
  const handleMedicineFieldChange = (medicineId, field, value) => {
    setSelectedMedicines((prev) => {
      const idx = prev.findIndex((x) => x.medicineId === medicineId);
      if (idx < 0) return prev;

      const m = medicines.find((md) => md.id === medicineId);
      const draft = [...prev];
      const row = { ...draft[idx], [field]: value };

      if (field === "quantity") {
        const qty = Math.max(0, Number(value || 0));
        const price = Number(m?.price || 0);
        row.quantity = qty;
        row.total = price * qty;
      }

      draft[idx] = row;
      return draft;
    });
  };

  // ====== Submit ======
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
        services: selectedServices,
        // gửi thêm mảng medicines theo format backend chờ  << thêm
        medicines: selectedMedicines.map((m) => ({
          medicineId: m.medicineId,
          quantity: Number(m.quantity || 0),
          dose: m.dose || "",
          frequency: m.frequency || "",
          duration: m.duration || "",
          route: m.route || "",
          instructions: m.instructions || "",
        })),
      };

      console.log("Payload:", payload);

      await axios.post(API_ENDPOINTS.CREATE_MEDICAL_RECORD, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Tạo hồ sơ khám bệnh thành công!");
      navigate("/doctor/exam-records");
    } catch (err) {
      console.error("Error creating medical record:", err);
      alert(err.response?.data?.error || "Không thể tạo hồ sơ khám bệnh.");
    } finally {
      setLoading(false);
    }
  };

  // ====== Filter ======
  const filteredServices = services.filter(
    (service) =>
      (service.name || "")
        .toLowerCase()
        .includes(searchService.toLowerCase()) ||
      (service.description || "")
        .toLowerCase()
        .includes(searchService.toLowerCase())
  );

  const filteredMedicines = medicines.filter(
    (m) =>
      (m.name || "").toLowerCase().includes(searchMedicine.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(searchMedicine.toLowerCase())
  );

  // ====== Tổng ======
  const totalService = selectedServices.reduce(
    (sum, s) => sum + Number(s.total || 0),
    0
  );
  const totalMedicine = selectedMedicines.reduce(
    (sum, m) => sum + Number(m.total || 0),
    0
  );

  if (loading) {
    return (
      <DoctorLayout
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        doctorInfo={doctorInfo}
      >
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Đang tải...</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      doctorInfo={doctorInfo}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4" />
        <div className="text-sm text-gray-500">
          Hôm nay: {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      <div className="max-w-4xl medium-h mx-auto p-8 bg-white rounded-xl shadow mt-8">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          Tạo Hồ Sơ Khám Bệnh
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Chọn bệnh nhân */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block font-semibold mb-3 text-lg">
              1. Chọn bệnh nhân <span className="text-red-500">*</span>
            </label>

            {patientsWithAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Không có lịch hẹn nào</p>
                <p className="text-sm mt-2">
                  Vui lòng kiểm tra lại lịch hẹn của bạn
                </p>
              </div>
            ) : (
              <>
                <select
                  className="w-full border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                  value={selectedPatient?.appointmentId || ""}
                  onChange={(e) => {
                    const patient = patientsWithAppointments.find(
                      (p) => p.appointmentId === Number(e.target.value)
                    );
                    setSelectedPatient(patient || null);
                  }}
                  required
                >
                  <option value="">-- Chọn bệnh nhân --</option>
                  {patientsWithAppointments.map((patient) => (
                    <option
                      key={patient.appointmentId}
                      value={patient.appointmentId}
                    >
                      {patient.patientName} - {patient.appointmentDate} (
                      {patient.appointmentTime})
                    </option>
                  ))}
                </select>

                {selectedPatient && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                    <p className="text-sm">
                      <strong>Họ tên:</strong> {selectedPatient.patientName}
                    </p>
                    <p className="text-sm">
                      <strong>SĐT:</strong> {selectedPatient.patientPhone}
                    </p>
                    <p className="text-sm">
                      <strong>Email:</strong> {selectedPatient.patientEmail}
                    </p>
                    <p className="text-sm">
                      <strong>Giới tính:</strong>{" "}
                      {selectedPatient.patientGender}
                    </p>
                    <p className="text-sm">
                      <strong>Ngày sinh:</strong>{" "}
                      {selectedPatient.patientDOB
                        ? new Date(
                            selectedPatient.patientDOB
                          ).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Ngày khám:</strong>{" "}
                      {selectedPatient.appointmentDate}
                    </p>
                    <p className="text-sm">
                      <strong>Giờ khám:</strong>{" "}
                      {selectedPatient.appointmentTime}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 2. Triệu chứng */}
          <div>
            <label className="block font-semibold mb-2 text-lg">
              2. Triệu chứng <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              placeholder="Nhập triệu chứng của bệnh nhân..."
              required
            />
          </div>

          {/* 3. Chẩn đoán */}
          <div>
            <label className="block font-semibold mb-2 text-lg">
              3. Chẩn đoán <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              placeholder="Nhập chẩn đoán bệnh..."
              required
            />
          </div>

          {/* 4. Phương pháp điều trị */}
          <div>
            <label className="block font-semibold mb-2 text-lg">
              4. Phương pháp điều trị <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={3}
              placeholder="Nhập phương pháp điều trị..."
              required
            />
          </div>

          {/* 5. Chọn dịch vụ */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between gap-4 mb-3">
              <label className="font-semibold text-lg whitespace-nowrap">
                5. Chọn dịch vụ <span className="text-red-500">*</span>
              </label>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm dịch vụ..."
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                    className="w-full border-2 border-green-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-green-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchService && (
                    <button
                      type="button"
                      onClick={() => setSearchService("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {searchService && (
              <p className="text-sm text-gray-600 mb-3">
                Tìm thấy {filteredServices.length} dịch vụ
              </p>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Không tìm thấy dịch vụ nào</p>
                  <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : (
                filteredServices.map((service) => {
                  const selected = selectedServices.find(
                    (s) => s.serviceId === service.id
                  );
                  return (
                    <div
                      key={service.id}
                      className="flex items-center gap-4 p-3 bg-white rounded border hover:border-green-400 transition"
                    >
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleServiceChange(service.id, 1);
                          } else {
                            handleServiceChange(service.id, 0);
                          }
                        }}
                        className="w-5 h-5 accent-green-600"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600">
                            {service.description}
                          </p>
                        )}
                        <p className="text-green-600 font-semibold">
                          {Number(service.price || 0).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      {selected && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold">
                            Số lượng:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={selected.quantity}
                            onChange={(e) =>
                              handleServiceChange(
                                service.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-20 border-2 rounded px-2 py-1 text-center focus:outline-none focus:border-green-500"
                          />
                          <span className="text-sm font-semibold text-green-600">
                            ={" "}
                            {Number(selected.total || 0).toLocaleString(
                              "vi-VN"
                            )}
                            đ
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border-2 border-green-400">
                <p className="font-semibold text-lg">Tổng chi phí dịch vụ:</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalService.toLocaleString("vi-VN")}đ
                </p>
              </div>
            )}
          </div>

          {/* 6. Kê thuốc */}
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center justify-between gap-4 mb-3">
              <label className="font-semibold text-lg whitespace-nowrap">
                6. Kê thuốc (tùy chọn)
              </label>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm thuốc..."
                    value={searchMedicine}
                    onChange={(e) => setSearchMedicine(e.target.value)}
                    className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-amber-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchMedicine && (
                    <button
                      type="button"
                      onClick={() => setSearchMedicine("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {searchMedicine && (
              <p className="text-sm text-gray-600 mb-3">
                Tìm thấy {filteredMedicines.length} thuốc
              </p>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMedicines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Không tìm thấy thuốc</p>
                  <p className="text-sm mt-2">Thử từ khóa khác</p>
                </div>
              ) : (
                filteredMedicines.map((med) => {
                  const picked = selectedMedicines.find(
                    (x) => x.medicineId === med.id
                  );
                  const outOfStock = Number(med.quantity || 0) <= 0;
                  const expired = med.expiryDate
                    ? new Date(med.expiryDate) < new Date()
                    : false;

                  return (
                    <div
                      key={med.id}
                      className={`flex flex-col gap-3 p-3 bg-white rounded border transition ${
                        expired ? "opacity-60" : "hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          disabled={expired || outOfStock}
                          checked={!!picked}
                          onChange={(e) =>
                            handleMedicineToggle(med.id, e.target.checked)
                          }
                          className="mt-1 w-5 h-5 accent-amber-600 disabled:opacity-40"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{med.name}</p>
                            {med.isPrescription && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                RX
                              </span>
                            )}
                          </div>
                          {med.description && (
                            <p className="text-sm text-gray-600">
                              {med.description}
                            </p>
                          )}
                          <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-3">
                            <span>
                              Đơn vị: <b>{med.unit || "-"}</b>
                            </span>
                            {med.form && (
                              <span>
                                Dạng: <b>{med.form}</b>
                              </span>
                            )}
                            {med.strength && (
                              <span>
                                Hàm lượng: <b>{med.strength}</b>
                              </span>
                            )}
                            {med.route && (
                              <span>
                                Đường dùng: <b>{med.route}</b>
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm">
                            Giá:{" "}
                            <b className="text-amber-700">
                              {Number(med.price || 0).toLocaleString("vi-VN")}đ
                            </b>{" "}
                            — Tồn kho:{" "}
                            <b className={outOfStock ? "text-red-600" : ""}>
                              {Number(med.quantity || 0)}
                            </b>
                            {expired && (
                              <span className="ml-2 text-red-600 font-semibold">
                                • Hết hạn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {picked && (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-3">
                          {/* Số lượng */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Số lượng
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full border rounded px-2 py-1"
                              value={picked.quantity}
                              onChange={(e) =>
                                handleMedicineFieldChange(
                                  med.id,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>

                          {/* Liều */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Liều
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              placeholder="vd: 1 viên/lần"
                              value={picked.dose}
                              onChange={(e) =>
                                handleMedicineFieldChange(
                                  med.id,
                                  "dose",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Tần suất */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Tần suất
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              placeholder="vd: 2 lần/ngày"
                              value={picked.frequency}
                              onChange={(e) =>
                                handleMedicineFieldChange(
                                  med.id,
                                  "frequency",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Thời gian */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Thời gian
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              placeholder="vd: 5 ngày"
                              value={picked.duration}
                              onChange={(e) =>
                                handleMedicineFieldChange(
                                  med.id,
                                  "duration",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Đường dùng */}
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Đường dùng
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              placeholder="uống/tiêm/nhỏ mắt..."
                              value={picked.route}
                              onChange={(e) =>
                                handleMedicineFieldChange(
                                  med.id,
                                  "route",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Hướng dẫn */}
                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-1">
                              Hướng dẫn
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded px-2 py-1"
                              placeholder="uống sau ăn..."
                              value={picked.instructions}
                              onChange={(e) =>
                                handleMedicineFieldChange(
                                  med.id,
                                  "instructions",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      )}

                      {picked && (
                        <div className="text-right text-sm">
                          Thành tiền:{" "}
                          <b className="text-amber-700">
                            {Number(picked.total || 0).toLocaleString("vi-VN")}đ
                          </b>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {selectedMedicines.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border-2 border-amber-400">
                <p className="font-semibold text-lg">Tổng tiền thuốc:</p>
                <p className="text-2xl font-bold text-amber-700">
                  {totalMedicine.toLocaleString("vi-VN")}đ
                </p>
              </div>
            )}
          </div>

          {/* Tổng cộng */}
          {(selectedServices.length > 0 || selectedMedicines.length > 0) && (
            <div className="mt-4 p-3 bg-white rounded border-2 border-gray-300">
              <p className="text-lg">
                Tổng dịch vụ: <b>{totalService.toLocaleString("vi-VN")}đ</b>
              </p>
              <p className="text-lg">
                Tổng thuốc: <b>{totalMedicine.toLocaleString("vi-VN")}đ</b>
              </p>
              <p className="text-xl font-bold">
                Tổng cộng:{" "}
                <span className="text-green-700">
                  {(totalService + totalMedicine).toLocaleString("vi-VN")}đ
                </span>
              </p>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || patientsWithAppointments.length === 0}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {loading ? "Đang xử lý..." : "Tạo hồ sơ khám bệnh"}
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
