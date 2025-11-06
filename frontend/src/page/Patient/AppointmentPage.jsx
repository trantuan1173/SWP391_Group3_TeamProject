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

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [doctors, setDoctors] = useState([]);

  // ✅ Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ✅ Lấy danh sách bác sĩ
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

  // ✅ Lấy danh sách lịch khám
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

  // ✅ Format
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
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        "/api/payments",
        {
          appointmentId: appointment.id,
          patientId: appointment.PatientId || appointment.patientId,
          amount: appointment.price || 100000,
          returnUrl: `http://localhost:5173/patient/${
            appointment.PatientId || appointment.patientId
          }`,
          cancelUrl: `http://localhost:5173/patient/${
            appointment.PatientId || appointment.patientId
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
        <select
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
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

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
                      {a.Employee?.name || a.doctorName || "Chưa rõ bác sĩ"}
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
