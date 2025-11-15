import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const SPECIALTIES = [
  "Nội khoa",
  "Ngoại khoa",
  "Sản - Nhi",
  "Da liễu - Thẩm mỹ",
  "Tâm lý - Tâm thần",
  "Phục hồi chức năng",
  "Y học cổ truyền",
];

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "cancelled",
  "to-payment",
  "completed",
];

export default function ReceptionistAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [error, setError] = useState("");
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shouldFetchAvailability, setShouldFetchAvailability] = useState(false);

  const a = appointment;

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const now = dayjs();
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDateTime = now.hour(hours).minute(minutes).second(0);
    const endDateTime = startDateTime.add(1, "hour");
    return endDateTime.format("HH:mm");
  };

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    if (appointment.status === "completed" && selectedStatus === "to-payment") {
      setError("Không thể chuyển từ trạng thái COMPLETED về TO-PAYMENT.");
      return;
    }
    setError("");
    setNewStatus(selectedStatus);
  };

  const handleStartTimeChange = (e) => {
    const startValue = e.target.value;
    setNewStartTime(startValue);
    setNewEndTime(calculateEndTime(startValue));
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.APPOINTMENT_BY_ID(id)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = res.data;
      setAppointment(data);

      // Khởi tạo input
      setNewDate(new Date(data.date).toISOString().split("T")[0]); // YYYY-MM-DD
      const dbStartTime = data.startTime.substring(0, 5);
      setNewStartTime(dbStartTime);
      setNewEndTime(calculateEndTime(dbStartTime));
      setNewStatus(data.status);
      setSelectedDoctorId(data.doctorId || "");
      setSelectedRoomId(data.roomId || "");
      setSelectedSpeciality(data.Employee?.speciality || "");
    } catch (err) {
      console.error("Failed to fetch appointment details:", err);
      toast.error("Lỗi khi tải chi tiết lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchAvailability = async () => {
    if (!newDate || !newStartTime || !newEndTime) return;
    setFetchingAvailability(true);

    const date = newDate;
    const startTime = newStartTime + ":00";
    const endTime = newEndTime + ":00";
    const specialityToSearch = selectedSpeciality;

    try {
      const doctorRes = await axios.get(API_ENDPOINTS.GET_AVAILABLE_DOCTORS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { date, startTime, endTime, speciality: specialityToSearch },
      });

      setAvailableDoctors(doctorRes.data.availableDoctors || []);
      setSuggestedSlots(doctorRes.data.suggestedSlots || []);

      const roomRes = await axios.get(API_ENDPOINTS.GET_AVAILABLE_ROOMS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { date, startTime, endTime },
      });
      setAvailableRooms(roomRes.data);

      if (
        doctorRes.data.availableDoctors?.length === 0 &&
        doctorRes.data.suggestedSlots?.length > 0
      ) {
        toast(
          `Không có bác sĩ khả dụng trong ${selectedSpeciality || "chuyên khoa này"
          } vào khung giờ ${newStartTime}-${newEndTime}. Đã tìm thấy ${doctorRes.data.suggestedSlots.length
          } gợi ý.`,
          { icon: "💡" }
        );
      } else if (
        doctorRes.data.availableDoctors?.length === 0 &&
        doctorRes.data.suggestedSlots?.length === 0
      ) {
        toast.error("Không tìm thấy bác sĩ khả dụng nào.");
      } else if (doctorRes.data.availableDoctors?.length > 0) {
        toast.success(
          `Đã tải danh sách bác sĩ khả dụng (${doctorRes.data.availableDoctors.length} người) cho khung giờ này.`
        );
      }
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      toast.error("Không thể tải danh sách khả dụng.");
    } finally {
      setFetchingAvailability(false);
    }
  };

  useEffect(() => {
    if (!loading && newDate && newStartTime && shouldFetchAvailability) {
    fetchAvailability();
    setShouldFetchAvailability(false);
  }
}, [selectedSpeciality, newDate, newStartTime, loading, shouldFetchAvailability]);

  const handleUpdate = async () => {
    if (
      !selectedDoctorId ||
      !selectedRoomId ||
      !newDate ||
      !newStartTime ||
      !newEndTime ||
      !newStatus
    ) {
      toast.error(
        "Vui lòng nhập đầy đủ Ngày, Thời gian, Bác sĩ, Phòng và Trạng thái."
      );
      return;
    }

    if (
      (newStatus === "confirmed" || newStatus === "pending") &&
      availableDoctors.findIndex((d) => d.id === selectedDoctorId) === -1
    ) {
      toast.error(
        "Bác sĩ được chọn KHÔNG khả dụng vào khung giờ này. Vui lòng chọn bác sĩ khác hoặc khung giờ khác."
      );
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        date: newDate,
        startTime: newStartTime + ":00",
        endTime: newEndTime + ":00",
        status: newStatus,
        doctorId: selectedDoctorId,
        roomId: selectedRoomId,
      };

      await axios.put(API_ENDPOINTS.UPDATE_APPOINTMENT(id), payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Cập nhật lịch khám thành công!");
      fetchDetail();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error(`Lỗi Trùng lịch: ${err.response.data.error}`);
      } else {
        console.error("Failed to update appointment:", err);
        toast.error("Cập nhật thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-sm">
          Đang tải chi tiết lịch hẹn...
        </div>
      </div>
    );

  if (!appointment)
    return (
      <div className="text-center text-gray-500 p-6">
        Không tìm thấy lịch hẹn.
      </div>
    );

  const currentSelectedDoctor =
    availableDoctors.find((d) => d.id === selectedDoctorId) || a.Employee;
  const currentSelectedRoom =
    availableRooms.find((r) => r.id === selectedRoomId) || a.Room;

  // -------- Helpers: dịch vụ & thuốc + tổng tiền --------
  const getServicesFromMedicalRecord = (medicalRecord) => {
    if (!medicalRecord || !medicalRecord.orderDetails) return [];
    try {
      const services = JSON.parse(medicalRecord.orderDetails);
      return Array.isArray(services) ? services : [];
    } catch (error) {
      console.error("Lỗi khi phân tích orderDetails:", error);
      return [];
    }
  };

  const getMedicinesFromMedicalRecord = (medicalRecord) => {
    if (!medicalRecord) return [];
    const arr =
      medicalRecord.prescribedMedicines ||
      medicalRecord.MedicalRecordMedicines ||
      [];
    return (arr || []).map((m) => ({
      name: m.name || "-",
      quantity: Number(m.quantity || 0),
      priceAtUse: Number(m.priceAtUse || 0),
      dose: m.dose || "",
      frequency: m.frequency || "",
      duration: m.duration || "",
      route: m.route || "",
      instructions: m.instructions || "",
      total: Number(m.total || 0),
    }));
  };

  const calculateTotal = (items) =>
    items.reduce((sum, it) => sum + Number(it.total || 0), 0);

  const currentServices = getServicesFromMedicalRecord(a?.MedicalRecord);
  const totalServiceAmount = calculateTotal(currentServices);

  const currentMedicines = getMedicinesFromMedicalRecord(a?.MedicalRecord);
  const totalMedicineAmount = calculateTotal(currentMedicines);

  const grandTotal =
    Number(totalServiceAmount || 0) + Number(totalMedicineAmount || 0);

  // -------- Thanh toán & In hoá đơn --------
  const handlePayment = async (appointment) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        "https://swp.gicunhco.com/api/payments",
        {
          appointmentId: appointment.id,
          patientId: appointment.PatientId || appointment.patientId,
          returnUrl: `http://localhost:5173/receptionist/appointments/${appointment.id}`,
          cancelUrl: `http://localhost:5173/receptionist/appointments/${appointment.id}`,
        },
        { headers }
      );

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert("Không nhận được link thanh toán từ server.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo thanh toán:", err);
      alert("Không thể khởi tạo thanh toán!");
    }
  };

  const handlePrintInvoice = (appointment, services, medicines, amount) => {
    const printWindow = window.open("", "", "height=600,width=800");

    const servicesRows = (services || [])
      .map(
        (s, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${s.name}</td>
            <td>${s.quantity || 1}</td>
            <td>${new Intl.NumberFormat("vi-VN").format(s.price)} VND</td>
            <td>${new Intl.NumberFormat("vi-VN").format(s.total)} VND</td>
          </tr>
        `
      )
      .join("");

    const medicineRows = (medicines || [])
      .map(
        (m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>
              ${m.name}
              ${m.instructions
            ? `<div style="font-size:11px;color:#6b7280">HD: ${m.instructions}</div>`
            : ""
          }
            </td>
            <td>${m.dose || "-"}</td>
            <td>${m.frequency || "-"}</td>
            <td>${m.duration || "-"}</td>
            <td>${m.route || "-"}</td>
            <td>${m.quantity}</td>
            <td>${new Intl.NumberFormat("vi-VN").format(m.priceAtUse)} VND</td>
            <td>${new Intl.NumberFormat("vi-VN").format(m.total)} VND</td>
          </tr>
        `
      )
      .join("");

    const invoiceContent = `
      <style>
        body { font-family: 'Arial', sans-serif; padding: 20px; }
        h1 { text-align: center; color: #4a5568; }
        h2 { color: #374151; margin-top: 24px; }
        .info { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f3f4f6; }
        .total { font-size: 1.2em; font-weight: bold; text-align: right; padding-top: 10px; }
      </style>
      <h1>HÓA ĐƠN KHÁM CHỮA BỆNH</h1>
      <div class="info">
        <p><strong>Mã Lịch Hẹn:</strong> ${appointment.id}</p>
        <p><strong>Ngày Thanh Toán:</strong> ${dayjs().format(
      "DD/MM/YYYY HH:mm"
    )}</p>
        <p><strong>Bệnh Nhân:</strong> ${appointment.Patient?.name || "N/A"}</p>
        <p><strong>Bác Sĩ Khám:</strong> ${appointment.Employee?.name || "N/A"
      }</p>
        <p><strong>Liên hệ Bác Sĩ:</strong> ${(appointment.Employee?.email
        ? "Email: " + appointment.Employee.email
        : "") +
      (appointment.Employee?.phoneNumber
        ? " — SDT: " + appointment.Employee.phoneNumber
        : "") || "N/A"
      }</p>
      </div>

      <h2>Chi tiết Dịch vụ</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th><th>Tên Dịch vụ</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>${servicesRows || `<tr><td colspan="5">Không có dịch vụ</td></tr>`
      }</tbody>
      </table>

      <h2>Thuốc đã kê</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th><th>Tên thuốc</th><th>Liều</th><th>Tần suất</th><th>Thời gian</th>
            <th>Đường dùng</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>${medicineRows || `<tr><td colspan="9">Không có thuốc</td></tr>`
      }</tbody>
      </table>

      <div class="total">Tổng cộng: ${new Intl.NumberFormat("vi-VN").format(
        amount
      )} VND</div>
      <p style="text-align: center; margin-top: 30px;">Xin chân thành cảm ơn!</p>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-700">
        Chi tiết lịch hẹn
      </h1>
      <div className="flex gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isEditing ? "bg-red-500 hover:bg-red-600 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
        >
          {isEditing ? "Hủy Chỉnh sửa" : "📝 Chỉnh sửa Lịch hẹn"}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          ← Quay lại
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 bg-gray-50 md:col-span-1">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Thông tin Bệnh nhân
            </h2>
            <p>
              <strong>Tên:</strong> {a.Patient?.name || "-"}
            </p>
            <p>
              <strong>SĐT:</strong> {a.Patient?.phoneNumber || "-"}
            </p>
            <p>
              <strong>Email:</strong> {a.Patient?.email || "-"}
            </p>
            <p>
              <strong>Giới tính:</strong> {a.Patient?.gender || "-"}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {a.Patient?.dateOfBirth
                ? new Date(a.Patient.dateOfBirth).toLocaleDateString("vi-VN")
                : "-"}
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 md:col-span-1">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              Lịch hẹn Hiện tại
            </h2>
            <p>
              <strong>Ngày:</strong>{" "}
              {new Date(a.date).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <strong>Thời gian:</strong> {a.startTime.substring(0, 5)} -{" "}
              {a.endTime.substring(0, 5)}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`font-medium text-${a.status === "confirmed" ? "blue" : "yellow"
                  }-600`}
              >
                {a.status}
              </span>
            </p>
            <hr className="my-3" />
            <p>
              <strong>Bác sĩ:</strong> {a.Employee?.name || "-"}
            </p>
            <p>
              <strong>Phòng:</strong> {a.Room?.name || "-"}
            </p>
          </div>
        </div>

        {a.MedicalRecord && (
          <div className="border border-green-500 rounded-lg p-4 bg-green-50 md:col-span-3">
            <h2 className="text-lg font-bold mb-4 text-green-800 flex items-center">
              Kết quả Khám & Hồ sơ Bệnh án
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-green-700">Triệu chứng:</p>
                <p className="text-gray-700 italic">
                  {a.MedicalRecord.symptoms || "Không có"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-700">Chẩn đoán:</p>
                <p className="text-gray-700 italic">
                  {a.MedicalRecord.diagnosis || "Chưa có chẩn đoán"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-green-700">
                  Phương pháp Điều trị/Kết luận:
                </p>
                <p className="text-gray-700 italic">
                  {a.MedicalRecord.treatment || "Chưa có phương pháp điều trị"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-green-700">Ngày tạo hồ sơ:</p>
                <p className="text-gray-700 italic">
                  {dayjs(a.MedicalRecord.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </div>

            <hr className="my-4 border-green-300" />

            {/* DỊCH VỤ */}
            <h3 className="text-md font-bold mb-3 text-green-800">
              Dịch vụ đã sử dụng
            </h3>
            {currentServices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-green-200 border border-green-300">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Tên Dịch vụ
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-200">
                    {currentServices.map((service, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name || "N/A"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {service.quantity || 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {service.price
                            ? new Intl.NumberFormat("vi-VN").format(
                              service.price
                            ) + " VND"
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {service.total
                            ? new Intl.NumberFormat("vi-VN").format(
                              service.total
                            ) + " VND"
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 italic text-sm">
                Không có dịch vụ nào được ghi nhận trong hồ sơ bệnh án này.
              </p>
            )}

            {/* THUỐC */}
            <h3 className="text-md font-bold mt-6 mb-3 text-green-800">
              Thuốc đã kê
            </h3>
            {currentMedicines.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-green-200 border border-green-300">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Tên thuốc
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Liều
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Tần suất
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Đường dùng
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        SL
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-200">
                    {currentMedicines.map((m, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {m.name}
                          {m.instructions ? (
                            <div className="text-xs text-gray-500 italic mt-1">
                              HD: {m.instructions}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {m.dose || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {m.frequency || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {m.duration || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {m.route || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {m.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {new Intl.NumberFormat("vi-VN").format(m.priceAtUse)}{" "}
                          VND
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-gray-700">
                          {new Intl.NumberFormat("vi-VN").format(m.total)} VND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 italic text-sm">
                Không có thuốc nào được kê trong hồ sơ này.
              </p>
            )}
          </div>
        )}

        {a.MedicalRecord &&
          (currentServices.length > 0 || currentMedicines.length > 0) && (
            <div className="border border-purple-500 rounded-lg p-4 bg-purple-50 md:col-span-3">
              <h2 className="text-lg font-bold mb-4 text-purple-800 flex items-center">
                Hóa đơn & Thanh toán
              </h2>

              <div className="flex flex-col gap-2 p-3 bg-purple-100 rounded-md mb-4">
                <div className="flex justify-between text-base">
                  <span className="text-purple-800">Tổng dịch vụ:</span>
                  <span className="text-purple-900 font-semibold">
                    {new Intl.NumberFormat("vi-VN").format(totalServiceAmount)}{" "}
                    VND
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-purple-800">Tổng thuốc:</span>
                  <span className="text-purple-900 font-semibold">
                    {new Intl.NumberFormat("vi-VN").format(totalMedicineAmount)}{" "}
                    VND
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-purple-800">TỔNG CỘNG:</span>
                  <span className="text-purple-900">
                    {new Intl.NumberFormat("vi-VN").format(grandTotal)} VND
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                Trạng thái hiện tại:{" "}
                <span className="font-semibold text-red-600">
                  {newStatus.toUpperCase()}
                </span>
                .
              </p>

              <div className="flex gap-4">
                {newStatus === "to-payment" && (
                  <button
                    onClick={() => handlePayment(a)}
                    disabled={newStatus === "completed" || isUpdating}
                    className={`flex-1 px-4 py-2 text-white font-semibold rounded-md transition-colors ${newStatus === "completed" || isUpdating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    {isUpdating ? "Đang xử lý..." : "Thanh toán PayOS"}
                  </button>
                )}

                <button
                  onClick={() => {
                    toast.success("Đang tiến hành tạo mẫu in hóa đơn...");
                    handlePrintInvoice(
                      a,
                      currentServices,
                      currentMedicines,
                      grandTotal
                    );
                  }}
                  className="flex-1 px-4 py-2 text-purple-600 font-semibold border border-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                >
                  <span className="mr-1">🖨️</span> In Hóa đơn
                </button>
              </div>
            </div>
          )}

        {/* CẬP NHẬT CHUNG */}
        {isEditing && ( // <--- THÊM ĐIỀU KIỆN RENDER NÀY
          <div className="border border-blue-400 rounded-lg p-4 bg-blue-50 md:col-span-2">
            <h2 className="text-lg font-bold mb-4 text-blue-800">
              Cập nhật Lịch hẹn
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày:
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bắt đầu (HH:MM):
                </label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={handleStartTimeChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kết thúc (1 giờ sau):
                </label>
                <input
                  type="time"
                  value={newEndTime}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select
                value={newStatus}
                onChange={handleStatusChange}
                className={`form-control ${error ? "border-red-500" : ""}`}
              >
                <option value="">--Chọn trạng thái--</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="to-payment">To Payment</option>
                <option value="completed">Completed</option>
              </select>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lọc Bác sĩ theo Chuyên khoa:
              </label>
              <select
                value={selectedSpeciality}
                onChange={(e) => setSelectedSpeciality(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                disabled={fetchingAvailability || isUpdating}
              >
                <option value="">-- Tất cả Chuyên khoa --</option>
                {SPECIALTIES.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn Bác sĩ Khả dụng:
              </label>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={fetchingAvailability || isUpdating}
                >
                  <option value="">-- Chọn Bác sĩ --</option>
                  {availableDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.speciality || "Chưa rõ"})
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchAvailability}
                  disabled={fetchingAvailability || isUpdating}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${fetchingAvailability
                    ? "bg-gray-400"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                  {fetchingAvailability ? "Đang tải..." : "Tải lại DS"}
                </button>
              </div>
              {availableDoctors.length === 0 &&
                !fetchingAvailability &&
                suggestedSlots.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Không tìm thấy bác sĩ khả dụng vào khung giờ này.
                  </p>
                )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn Phòng khám Khả dụng:
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                disabled={fetchingAvailability || isUpdating}
              >
                <option value="">-- Chọn Phòng khám --</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && !fetchingAvailability && (
                <p className="text-red-500 text-xs mt-1">
                  Không tìm thấy phòng khả dụng nào.
                </p>
              )}
            </div>

            {availableDoctors.length === 0 && suggestedSlots.length > 0 && (
              <div className="mt-4 p-3 border border-red-300 bg-red-50 rounded-md">
                <h3 className="text-md font-bold text-red-800 mb-2">
                  ⚠ Gợi ý Thời gian Khác:
                </h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {suggestedSlots.map((slot, index) => (
                    <li key={index}>
                      <strong>{slot.date}</strong> lúc{" "}
                      <strong>
                        {slot.startTime} - {slot.endTime}
                      </strong>
                      : ({slot.availableDoctorsCount} bác sĩ khả dụng)
                    </li>
                  ))}
                </ul>
                <p className="text-red-800 text-xs mt-2 font-semibold">
                  Bạn có thể nhập Ngày và Thời gian gợi ý vào các ô trên để kiểm
                  tra và Cập nhật.
                </p>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={
                !selectedDoctorId ||
                !selectedRoomId ||
                isUpdating ||
                fetchingAvailability
              }
              className={`w-full mt-4 px-4 py-2 text-white font-semibold rounded-md transition-colors ${!selectedDoctorId ||
                !selectedRoomId ||
                isUpdating ||
                fetchingAvailability
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isUpdating ? "Đang cập nhật..." : "Lưu Thay Đổi (UPDATE)"}
            </button>
          </div>

        )}

        <div className="border rounded-lg p-4 bg-gray-50 md:col-span-3">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Ghi chú</h2>
          <p>{a.notes || "Không có ghi chú."}</p>
        </div>
      </div>
    </div >
  );
}
