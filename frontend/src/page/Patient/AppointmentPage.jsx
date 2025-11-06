import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useParams } from "react-router-dom";

export default function AppointmentPage() {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [doctors, setDoctors] = useState([]);

  const handleViewDetail = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId), { headers });
      setSelectedAppointment(res.data);
      // Try to load feedback for this appointment
      try {
        const fbRes = await axios.get(`/api/appointments/${appointmentId}/feedback`, { headers });
        setFeedback(fbRes.data);
      } catch (e) {
        // 404 means no feedback yet — ignore, other errors log
        if (e.response && e.response.status !== 404) console.error('Lỗi khi lấy feedback:', e);
        setFeedback(null);
      }
      console.log(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết lịch hẹn:", err);
      alert("Không thể tải chi tiết lịch hẹn!");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.DOCTOR_LIST);
        if (!mounted) return;
        setDoctors(res.data.doctors || []);
      } catch (e) {
        console.error("Lỗi lấy danh sách bác sĩ:", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchAppointments() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter,
          from: fromDate,
          to: toDate,
          doctorId: doctorFilter,
          search: debouncedSearch,
        };

        const res = await axios.get(
          API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id),
          { headers, params }
        );
        const data = res.data;
        const list =
          data?.appointments || data?.rows || data?.data || data || [];

        if (mounted) {
          setAppointments(list);
          setTotalItems(
            data?.total ||
            data?.count ||
            (Array.isArray(data) ? data.length : 0)
          );
        }
      } catch (err) {
        console.error("Lỗi lấy lịch khám:", err);
        if (mounted) setAppointments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchAppointments();
    return () => (mounted = false);
  }, [
    id,
    currentPage,
    itemsPerPage,
    statusFilter,
    fromDate,
    toDate,
    doctorFilter,
    debouncedSearch,
  ]);

  const formatDateTime = (str) => {
    try {
      const d = new Date(str);
      return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString(
        "vi-VN"
      )}`;
    } catch {
      return str || "-";
    }
  };

  const formatDayMonth = (str) => {
    try {
      const d = new Date(str);
      return {
        day: d.getDate(),
        month: d.toLocaleString("vi-VN", { month: "short" }),
      };
    } catch {
      return { day: "-", month: "" };
    }
  };

  const handlePayment = async (appointment) => {
    try {
      console.log("💸 Tạo thanh toán cho lịch:", appointment);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        "/api/payments",
        {
          appointmentId: appointment.id,
          patientId: appointment.PatientId || appointment.patientId,
          amount: appointment.price || 100000,
          returnUrl: `http://localhost:5173/patient/${appointment.PatientId || appointment.patientId
            }`,
          cancelUrl: `http://localhost:5173/patient/${appointment.PatientId || appointment.patientId
            }`,
        },
        { headers }
      );

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert("Không tạo được link thanh toán!");
      }
    } catch (err) {
      console.error("Lỗi khi tạo thanh toán:", err);
      alert("Tạo thanh toán thất bại!");
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Lịch khám</h2>

      {/* --- Bộ lọc --- */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo bác sĩ, phòng, ghi chú..."
          className="border px-3 py-2 rounded w-full max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="to-payment">Chờ thanh toán</option>
          <option value="completed">Đã khám</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        {/* <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Tất cả bác sĩ</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select> */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        {/* <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 rounded"
        /> */}
      </div>

      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 text-center">Chi tiết Lịch hẹn</h2>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">🧍‍♂️ Thông tin Bệnh nhân</h3>
              <p><strong>Tên:</strong> {selectedAppointment.Patient?.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedAppointment.Patient?.email || "N/A"}</p>
              <p><strong>SĐT:</strong> {selectedAppointment.Patient?.phoneNumber || "N/A"}</p>
              <p><strong>Giới tính:</strong> {selectedAppointment.Patient?.gender || "N/A"}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">👨‍⚕️ Thông tin Bác sĩ</h3>
              <p><strong>Tên:</strong> {selectedAppointment.Employee?.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedAppointment.Employee?.email || "N/A"}</p>
              <p><strong>SĐT:</strong> {selectedAppointment.Employee?.phoneNumber || "N/A"}</p>
              <p><strong>Chuyên khoa:</strong> {selectedAppointment.Employee?.speciality || "N/A"}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">🏥 Thông tin Lịch hẹn</h3>
              <p><strong>Ngày:</strong> {new Date(selectedAppointment.date).toLocaleDateString("vi-VN")}</p>
              <p><strong>Thời gian:</strong> {selectedAppointment.startTime?.substring(0, 5)} - {selectedAppointment.endTime?.substring(0, 5)}</p>
              <p><strong>Phòng:</strong> {selectedAppointment.Room?.name || "N/A"} ({selectedAppointment.Room?.type || "Không xác định"})</p>
              <p><strong>Trạng thái:</strong> <span className="font-semibold text-blue-600">{selectedAppointment.status}</span></p>
              <p><strong>Người tạo:</strong> {selectedAppointment.createByType === "patient" ? "Bệnh nhân" : "Nhân viên"}</p>
              <p><strong>Ngày tạo:</strong> {new Date(selectedAppointment.createdAt).toLocaleString("vi-VN")}</p>
            </div>

            {selectedAppointment.MedicalRecord && (
              <div className="mb-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">📋 Hồ sơ Bệnh án</h3>
                <p><strong>Triệu chứng:</strong> {selectedAppointment.MedicalRecord.symptoms || "Không có"}</p>
                <p><strong>Chẩn đoán:</strong> {selectedAppointment.MedicalRecord.diagnosis || "Chưa có"}</p>
                <p><strong>Phương pháp điều trị:</strong> {selectedAppointment.MedicalRecord.treatment || "Chưa có"}</p>
                <p><strong>Ngày tạo hồ sơ:</strong> {new Date(selectedAppointment.MedicalRecord.createdAt).toLocaleString("vi-VN")}</p>

                {/* Dịch vụ khám */}
                <div className="mt-3">
                  <h4 className="text-md font-semibold text-gray-700 mb-1">💊 Dịch vụ sử dụng:</h4>
                  {(() => {
                    let services = [];
                    try {
                      services = JSON.parse(selectedAppointment.MedicalRecord.orderDetails || "[]");
                    } catch { }
                    return services.length > 0 ? (
                      <table className="w-full text-sm border border-gray-300 mt-2">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-2 py-1">Tên Dịch vụ</th>
                            <th className="border px-2 py-1">Số lượng</th>
                            <th className="border px-2 py-1">Đơn giá</th>
                            <th className="border px-2 py-1">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((s, i) => (
                            <tr key={i}>
                              <td className="border px-2 py-1">{s.name}</td>
                              <td className="border px-2 py-1 text-center">{s.quantity || 1}</td>
                              <td className="border px-2 py-1 text-right">{new Intl.NumberFormat("vi-VN").format(s.price)} VND</td>
                              <td className="border px-2 py-1 text-right font-semibold">{new Intl.NumberFormat("vi-VN").format(s.total)} VND</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="italic text-gray-500">Không có dịch vụ nào được ghi nhận.</p>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Feedback section */}
            <div className="mb-4 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">⭐ Phản hồi</h3>
              {feedback ? (
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-700">Điểm: <strong>{feedback.rating}</strong></div>
                  <div className="mt-2 text-gray-600 whitespace-pre-wrap">{feedback.content}</div>
                  <div className="text-xs text-gray-400 mt-2">Gửi lúc: {new Date(feedback.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              ) : (
                <div className="italic text-gray-500">Chưa có phản hồi cho lịch khám này.</div>
              )}

              {/* Feedback form shown only when appointment is completed and patient hasn't submitted feedback */}
              {selectedAppointment.status === 'completed' && (!feedback || (feedback && feedback.patientId !== (selectedAppointment.Patient?.id || selectedAppointment.patientId))) && (
                <div className="mt-3">
                  {!showFeedbackForm ? (
                    <button onClick={() => setShowFeedbackForm(true)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Gửi phản hồi</button>
                  ) : (
                    <div className="mt-2 bg-white p-3 border rounded">
                      <label className="block text-sm mb-1">Điểm (1-5)</label>
                      <select value={feedbackRating} onChange={(e) => setFeedbackRating(Number(e.target.value))} className="border px-2 py-1 rounded">
                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <label className="block text-sm mt-2 mb-1">Nội dung</label>
                      <textarea value={feedbackContent} onChange={(e) => setFeedbackContent(e.target.value)} className="w-full border rounded p-2" rows={4} />
                      <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => { setShowFeedbackForm(false); setFeedbackContent(''); setFeedbackRating(5); }} className="px-3 py-1 border rounded">Hủy</button>
                        <button onClick={async () => {
                          // submit feedback
                          if (!feedbackContent.trim()) return alert('Nội dung phản hồi không được để trống');
                          try {
                            const token = localStorage.getItem('token');
                            const headers = token ? { Authorization: `Bearer ${token}` } : {};
                            const res = await axios.post(`/api/appointments/${selectedAppointment.id}/feedback`, { content: feedbackContent.trim(), rating: feedbackRating }, { headers });
                            if (res.status === 201) {
                              setFeedback(res.data.feedback || { content: feedbackContent.trim(), rating: feedbackRating, createdAt: new Date().toISOString(), patientId: (selectedAppointment.Patient?.id || selectedAppointment.patientId) });
                              setShowFeedbackForm(false);
                              setFeedbackContent('');
                              setFeedbackRating(5);
                              alert('Gửi phản hồi thành công');
                            }
                          } catch (e) {
                            console.error('Lỗi gửi feedback:', e);
                            alert('Gửi phản hồi thất bại');
                          }
                        }} className="px-3 py-1 bg-green-600 text-white rounded">Gửi</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Danh sách lịch khám --- */}
      {loading ? (
        <div className="p-6">Đang tải...</div>
      ) : appointments.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
          Chưa có lịch khám.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((a) => {
              const { day, month } = formatDayMonth(a.date);
              const statusMap = {
                pending: ["Chờ xác nhận", "text-yellow-600"],
                confirmed: ["Đã xác nhận", "text-blue-600"],
                "to-payment": ["Chờ thanh toán", "text-orange-600"],
                completed: ["Đã khám", "text-green-600"],
                cancelled: ["Đã hủy", "text-red-600"],
              };
              const [statusLabel, statusColor] = statusMap[a.status] || [
                a.status,
                "text-gray-600",
              ];

              return (
                <div
                  key={a.id}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-lg bg-green-50 flex flex-col items-center justify-center text-green-700">
                    <div className="text-lg font-bold">{day}</div>
                    <div className="text-xs">{month}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {"Bác sĩ: " + (a.Employee?.name || a.doctorName || "Chưa rõ bác sĩ")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateTime(a.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {a.startTime} — {a.endTime} • {a.Room?.name || "N/A"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-sm font-medium ${statusColor}`}>
                      {statusLabel}
                    </div>

                    {a.status === "to-payment" && (
                      <button
                        onClick={() => handlePayment(a)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Thanh toán
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetail(a.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Xem
                    </button>

                    {/* Nút Hủy */}
                    {(a.status === "pending" || a.status === "confirmed") && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("Bạn có chắc muốn hủy lịch này?"))
                            return;
                          try {
                            const token = localStorage.getItem("token");
                            const headers = token
                              ? { Authorization: `Bearer ${token}` }
                              : {};
                            await axios.put(
                              API_ENDPOINTS.APPOINTMENT_BY_ID(a.id),
                              { status: "cancelled" },
                              { headers }
                            );
                            setAppointments((prev) =>
                              prev.map((ap) =>
                                ap.id === a.id
                                  ? { ...ap, status: "cancelled" }
                                  : ap
                              )
                            );
                          } catch (err) {
                            alert("Hủy lịch thất bại!");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline mt-1"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- Phân trang --- */}
          <div className="mt-6 flex justify-center items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <div className="px-3 py-1">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
