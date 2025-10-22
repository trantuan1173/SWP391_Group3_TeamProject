import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useParams } from "react-router-dom";

export default function AppointmentPage() {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [feedbackOpenFor, setFeedbackOpenFor] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id), { headers });
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : (data && Array.isArray(data.appointments) ? data.appointments : []));
        // Fetch existing feedback for each appointment (if any)
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.appointments) ? data.appointments : []);
        try {
          const feedbackPromises = list.map((a) =>
            axios.get(`/api/appointments/${a.id}/feedback`, { headers })
              .then((r) => ({ id: a.id, feedback: r.data }))
              .catch(() => ({ id: a.id, feedback: null }))
          );
          const fRes = await Promise.all(feedbackPromises);
          const map = {};
          fRes.forEach((r) => { map[r.id] = r.feedback || null; });
          setFeedbacks(map);
        } catch (e) {
          // ignore feedback fetch errors
        }
      } catch (err) {
        setAppointments([]);
      }
    }
    if (id) fetchAppointments();
  }, [id]);

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

  // Tính danh sách item hiện tại theo page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = appointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
//
  return (

    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Lịch khám</h2>
      {appointments.length === 0 ? (
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
                case "confirmed": statusLabel = "Đã xác nhận"; statusColor = "text-green-600"; break;
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
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 border rounded ${currentPage === i+1 ? "bg-blue-600 text-white" : ""}`}
                  onClick={() => setCurrentPage(i+1)}
                >
                  {i+1}
                </button>
              ))}
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
