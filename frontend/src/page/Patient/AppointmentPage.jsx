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
  const [feedbackOpenFor, setFeedbackOpenFor] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [doctors, setDoctors] = useState([]);

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
        const data = res.data;
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.doctors) ? data.doctors : []);
        setDoctors(list);
      } catch (e) {
        // ignore
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
        const params = { page: currentPage, limit: itemsPerPage };
        if (statusFilter) params.status = statusFilter;
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
        if (doctorFilter) params.doctorId = doctorFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id), { headers, params });
        const data = res.data;

        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.appointments)) list = data.appointments;
        else if (data && Array.isArray(data.data)) list = data.data;
        else if (data && Array.isArray(data.rows)) list = data.rows;
        else list = [];

        if (!mounted) return;
        setAppointments(list || []);
        const total = (data && (data.total || data.count)) || (Array.isArray(data) ? data.length : list.length);
        setTotalItems(total || 0);

        try {
          const feedbackPromises = list.map((a) =>
            axios.get(`/api/appointments/${a.id}/feedback`, { headers })
              .then((r) => ({ id: a.id, feedback: r.data }))
              .catch(() => ({ id: a.id, feedback: null }))
          );
          const fRes = await Promise.all(feedbackPromises);
          const map = {};
          fRes.forEach((r) => { map[r.id] = r.feedback || null; });
          if (mounted) setFeedbacks(map);
        } catch (e) {
          // ignore
        }
      } catch (err) {
        if (mounted) setAppointments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchAppointments();
    return () => (mounted = false);
  }, [id, currentPage, itemsPerPage, statusFilter, fromDate, toDate, doctorFilter, debouncedSearch]);

  function formatDateTime(dateTimeStr) {
    try {
      const d = new Date(dateTimeStr);
      return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN")}`;
    } catch (e) {
      return dateTimeStr || "-";
    }
  }

  function formatDayMonth(dateStr) {
    try {
      const d = new Date(dateStr);
      return { day: d.getDate(), month: d.toLocaleString("vi-VN", { month: "short" }) };
    } catch (e) {
      return { day: "-", month: "" };
    }
  }

  const currentItems = appointments;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : Math.ceil((appointments.length || 0) / itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Lịch khám</h2>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo bác sĩ, phòng, ghi chú..." className="border px-3 py-2 rounded w-full max-w-md" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Đã khám</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Tất cả bác sĩ</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-3 py-2 rounded" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-3 py-2 rounded" />
      </div>

      {loading ? (
        <div className="p-6">Đang tải...</div>
      ) : appointments.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Chưa có lịch khám.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((a) => {
              const { day, month } = formatDayMonth(a.date);
              let statusLabel = "";
              let statusColor = "";
              switch (a.status) {
                case "pending": statusLabel = "Chờ xác nhận"; statusColor = "text-yellow-600"; break;
                case "completed": statusLabel = "Đã khám"; statusColor = "text-blue-600"; break;
                case "cancelled": statusLabel = "Đã hủy"; statusColor = "text-red-600"; break;
                default: statusLabel = a.status; statusColor = "text-gray-600";
              }
              return (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-green-50 flex flex-col items-center justify-center text-green-700">
                    <div className="text-lg font-bold">{day}</div>
                    <div className="text-xs">{month}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{a.Employee?.name || a.doctorName || "Chưa rõ bác sĩ"}</div>
                    <div className="text-sm text-gray-500">{formatDateTime(a.date)}</div>
                    <div className="text-sm text-gray-500">{a.startTime} — {a.endTime} • {a.Room?.name || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-sm font-medium ${statusColor}`}>{statusLabel}</div>
                    {(a.status === "pending" || a.status === "confirmed") && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("Bạn có chắc muốn hủy lịch này?")) return;
                          try {
                            const token = localStorage.getItem("token");
                            const headers = token ? { Authorization: `Bearer ${token}` } : {};
                            await axios.put(API_ENDPOINTS.APPOINTMENT_BY_ID(a.id), { status: "cancelled" }, { headers });
                            setAppointments((prev) => prev.map((ap) => ap.id === a.id ? { ...ap, status: "cancelled" } : ap));
                          } catch (err) {
                            alert("Hủy lịch thất bại!");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline mt-1"
                      >
                        Hủy
                      </button>
                    )}
                    {a.status === 'completed' && (
                      <div className="mt-2">
                        {!feedbacks[a.id] ? (
                          <>
                            <button onClick={() => setFeedbackOpenFor(a.id)} className="text-sm text-blue-600 hover:underline">Gửi phản hồi</button>
                            {feedbackOpenFor === a.id && (
                              <div className="mt-2">
                                <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} className="w-full border p-2 rounded mb-2" placeholder="Viết phản hồi của bạn" />
                                <div className="flex items-center gap-2 mb-2">
                                  <label className="text-sm">Đánh giá:</label>
                                  <select value={feedbackRating} onChange={(e) => setFeedbackRating(parseInt(e.target.value))} className="border rounded px-2 py-1">
                                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={async () => {
                                    try {
                                      const res = await axios.post(`/api/appointments/${a.id}/feedback`, { content: feedbackText, rating: feedbackRating });
                                      const fb = res.data && res.data.feedback ? res.data.feedback : { content: feedbackText, rating: feedbackRating };
                                      setFeedbacks((m) => ({ ...m, [a.id]: fb }));
                                      alert('Gửi phản hồi thành công');
                                    } catch (err) {
                                      console.error('Send feedback error', err, err.response && err.response.data);
                                      const msg = err.response && err.response.data && (err.response.data.error || err.response.data.message);
                                      alert(msg || 'Gửi phản hồi thất bại');
                                    }
                                    setFeedbackOpenFor(null);
                                    setFeedbackText('');
                                    setFeedbackRating(5);
                                  }} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Gửi</button>
                                  <button onClick={() => { setFeedbackOpenFor(null); setFeedbackText(''); setFeedbackRating(5); }} className="px-3 py-1 border rounded text-sm">Hủy</button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-green-600 mt-2">
                            <div className="font-medium">Phản hồi của bạn:</div>
                            <div className="text-sm">Đánh giá: {feedbacks[a.id].rating}</div>
                            <div className="text-sm">{feedbacks[a.id].content}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <div className="px-3 py-1">Trang {currentPage} / {totalPages || 1}</div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages || p + 1))}
              disabled={totalPages > 0 ? currentPage === totalPages : false}
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
