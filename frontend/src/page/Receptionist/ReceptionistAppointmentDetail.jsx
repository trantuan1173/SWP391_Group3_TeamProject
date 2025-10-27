import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import toast from "react-hot-toast";
import dayjs from 'dayjs';

const SPECIALTIES = [
  "Nội khoa",
  "Ngoại khoa",
  "Sản - Nhi",
  "Da liễu - Thẩm mỹ",
  "Tâm lý - Tâm thần",
  "Phục hồi chức năng",
  "Y học cổ truyền",
];

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled", "completed", "to-payment"];

export default function ReceptionistAppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const a = appointment;

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const now = dayjs();
    const [hours, minutes] = startTime.split(':').map(Number);

    const startDateTime = now.hour(hours).minute(minutes).second(0);
    const endDateTime = startDateTime.add(1, 'hour');

    return endDateTime.format('HH:mm');
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
      console.log(data);
      setAppointment(data);

      // Khởi tạo giá trị cho các input mới
      setNewDate(new Date(data.date).toISOString().split('T')[0]); // YYYY-MM-DD

      const dbStartTime = data.startTime.substring(0, 5);
      setNewStartTime(dbStartTime);
      setNewEndTime(calculateEndTime(dbStartTime)); // Tính lại cho slot 1 giờ

      setNewStatus(data.status);

      setSelectedDoctorId(data.doctorId || "");
      setSelectedRoomId(data.roomId || "");

      if (data.Employee?.speciality) {
        setSelectedSpeciality(data.Employee.speciality);
      } else {
        setSelectedSpeciality("");
      }

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

      // Logic thông báo
      if (doctorRes.data.availableDoctors?.length === 0 && doctorRes.data.suggestedSlots?.length > 0) {
        toast(`Không có bác sĩ khả dụng trong ${selectedSpeciality || 'chuyên khoa này'} vào khung giờ ${newStartTime}-${newEndTime}. Đã tìm thấy ${doctorRes.data.suggestedSlots.length} gợi ý.`, { icon: '💡' });
      } else if (doctorRes.data.availableDoctors?.length === 0 && doctorRes.data.suggestedSlots?.length === 0) {
        toast.error("Không tìm thấy bác sĩ khả dụng nào.");
      } else if (doctorRes.data.availableDoctors?.length > 0) {
        toast.success(`Đã tải danh sách bác sĩ khả dụng (${doctorRes.data.availableDoctors.length} người) cho khung giờ này.`);
      }
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      toast.error("Không thể tải danh sách khả dụng.");
    } finally {
      setFetchingAvailability(false);
    }
  };

  useEffect(() => {
    if (!loading && newDate && newStartTime) {
      fetchAvailability();
    }
  }, [selectedSpeciality, newDate, newStartTime, loading]);


  const handleUpdate = async () => {
    if (!selectedDoctorId || !selectedRoomId || !newDate || !newStartTime || !newEndTime || !newStatus) {
      toast.error("Vui lòng nhập đầy đủ Ngày, Thời gian, Bác sĩ, Phòng và Trạng thái.");
      return;
    }

    if ((newStatus === 'confirmed' || newStatus === 'pending') && availableDoctors.findIndex(d => d.id === selectedDoctorId) === -1) {
      toast.error("Bác sĩ được chọn KHÔNG khả dụng vào khung giờ này. Vui lòng chọn bác sĩ khác hoặc khung giờ khác.");
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
        <div className="text-gray-500 text-sm">Đang tải chi tiết lịch hẹn...</div>
      </div>
    );

  if (!appointment)
    return (
      <div className="text-center text-gray-500 p-6">Không tìm thấy lịch hẹn.</div>
    );

  const currentSelectedDoctor = availableDoctors.find(d => d.id === selectedDoctorId) || a.Employee;
  const currentSelectedRoom = availableRooms.find(r => r.id === selectedRoomId) || a.Room;


  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Chi tiết lịch hẹn #{a.id}
        </h1>
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
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Thông tin Bệnh nhân</h2>
            <p><strong>Tên:</strong> {a.Patient?.name || "-"}</p>
            <p><strong>SĐT:</strong> {a.Patient?.phoneNumber || "-"}</p>
            <p><strong>Email:</strong> {a.Patient?.email || "-"}</p>
            <p><strong>Giới tính:</strong> {a.Patient?.gender || "-"}</p>
            <p><strong>Ngày sinh:</strong> {a.Patient?.dateOfBirth
              ? new Date(a.Patient.dateOfBirth).toLocaleDateString("vi-VN")
              : "-"}</p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 md:col-span-1">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Lịch hẹn Hiện tại</h2>
            <p><strong>Ngày:</strong> {new Date(a.date).toLocaleDateString("vi-VN")}</p>
            <p><strong>Thời gian:</strong> {a.startTime.substring(0, 5)} - {a.endTime.substring(0, 5)}</p>
            <p><strong>Trạng thái:</strong> <span className={`font-medium text-${a.status === 'confirmed' ? 'blue' : 'yellow'}-600`}>{a.status}</span></p>
            <hr className="my-3" />
            <p><strong>Bác sĩ:</strong> {a.Employee?.name || "-"}</p>
            <p><strong>Phòng:</strong> {a.Room?.name || "-"}</p>
          </div>
        </div>
        {/* KẾT QUẢ KHÁM VÀ DỊCH VỤ SỬ DỤNG (CHỈ HIỂN THỊ KHI CÓ MEDICAL RECORD) */}
        {a.MedicalRecord && (
          <div className="border border-green-500 rounded-lg p-4 bg-green-50 md:col-span-3">
            <h2 className="text-lg font-bold mb-4 text-green-800 flex items-center">
              <span className="mr-2">📝</span> Kết quả Khám & Hồ sơ Bệnh án
            </h2>

            {/* THÔNG TIN CHÍNH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-green-700">Triệu chứng:</p>
                <p className="text-gray-700 italic">{a.MedicalRecord.symptoms || "Không có"}</p>
              </div>
              <div>
                <p className="font-semibold text-green-700">Chẩn đoán:</p>
                <p className="text-gray-700 italic">{a.MedicalRecord.diagnosis || "Chưa có chẩn đoán"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-green-700">Kết luận/Lời khuyên:</p>
                <p className="text-gray-700 italic">{a.MedicalRecord.conclusion || "Không có kết luận"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-green-700">Ngày khám:</p>
                <p className="text-gray-700 italic">{dayjs(a.MedicalRecord.date).format('DD/MM/YYYY HH:mm')}</p>
              </div>
            </div>

            <hr className="my-4 border-green-300" />

            {/* BẢNG DỊCH VỤ SỬ DỤNG */}
            <h3 className="text-md font-bold mb-3 text-green-800">Dịch vụ đã sử dụng</h3>
            {a.MedicalRecord.servicesUsed && a.MedicalRecord.servicesUsed.length > 0 ? (
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
                    {a.MedicalRecord.servicesUsed.map((service, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {service.quantity || 1}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {service.price ? new Intl.NumberFormat('vi-VN').format(service.price) + ' VND' : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {service.price ? new Intl.NumberFormat('vi-VN').format(service.price * (service.quantity || 1)) + ' VND' : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 italic text-sm">Không có dịch vụ nào được ghi nhận trong hồ sơ bệnh án này.</p>
            )}
          </div>
        )}
        {/* CẬP NHẬT CHUNG */}
        <div className="border border-blue-400 rounded-lg p-4 bg-blue-50 md:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-blue-800">Cập nhật Lịch hẹn</h2>

          {/* Input fields for Date & Time & Status */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu (HH:MM):</label>
              <input
                type="time"
                value={newStartTime}
                onChange={handleStartTimeChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc (1 giờ sau):</label>
              <input
                type="time"
                value={newEndTime}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-200 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái:</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Dropdown CHỌN CHUYÊN KHOA */}
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
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          {/* Select Doctor */}
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
                    {d.name} ({d.speciality || 'Chưa rõ'})
                  </option>
                ))}
              </select>
              <button
                onClick={fetchAvailability}
                disabled={fetchingAvailability || isUpdating}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${fetchingAvailability ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                {fetchingAvailability ? 'Đang tải...' : 'Tải lại DS'}
              </button>
            </div>
            {availableDoctors.length === 0 && !fetchingAvailability && suggestedSlots.length === 0 && (
              <p className="text-red-500 text-xs mt-1">Không tìm thấy bác sĩ khả dụng vào khung giờ này.</p>
            )}
          </div>

          {/* Select Room */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Phòng khám Khả dụng:</label>
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
            {availableRooms.length === 0 && !fetchingAvailability && <p className="text-red-500 text-xs mt-1">Không tìm thấy phòng khả dụng nào.</p>}
          </div>

          {/* SUGGESTION BLOCK */}
          {availableDoctors.length === 0 && suggestedSlots.length > 0 && (
            <div className="mt-4 p-3 border border-red-300 bg-red-50 rounded-md">
              <h3 className="text-md font-bold text-red-800 mb-2">⚠ Gợi ý Thời gian Khác:</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {suggestedSlots.map((slot, index) => (
                  <li key={index}>
                    **{slot.date}** lúc **{slot.startTime} - {slot.endTime}**: ({slot.availableDoctorsCount} bác sĩ khả dụng)
                  </li>
                ))}
              </ul>
              <p className="text-red-800 text-xs mt-2 font-semibold">
                **Hành động:** Bạn có thể nhập Ngày và Thời gian gợi ý vào các ô trên để kiểm tra và Cập nhật.
              </p>
            </div>
          )}

          {/* Cập nhật Button */}
          <button
            onClick={handleUpdate}
            disabled={!selectedDoctorId || !selectedRoomId || isUpdating || fetchingAvailability}
            className={`w-full mt-4 px-4 py-2 text-white font-semibold rounded-md transition-colors ${(!selectedDoctorId || !selectedRoomId || isUpdating || fetchingAvailability)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isUpdating ? 'Đang cập nhật...' : 'Lưu Thay Đổi (UPDATE)'}
          </button>
        </div>

        {/* Notes */}
        <div className="border rounded-lg p-4 bg-gray-50 md:col-span-3">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Ghi chú</h2>
          <p>{a.notes || "Không có ghi chú."}</p>
        </div>
      </div>
    </div>
  );
}
