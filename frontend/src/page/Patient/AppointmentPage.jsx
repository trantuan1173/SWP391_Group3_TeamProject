import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useParams } from "react-router-dom";

export default function AppointmentPage() {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id), { headers });
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : (data && Array.isArray(data.appointments) ? data.appointments : []));
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Lịch khám</h2>
      {appointments.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Chưa có lịch khám.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((a) => {
            const { day, month } = formatDayMonth(a.date);
            let statusLabel = "";
            let statusColor = "";
            switch (a.status) {
              case "pending":
                statusLabel = "Chờ xác nhận"; statusColor = "text-yellow-600"; break;
              case "confirmed":
                statusLabel = "Đã xác nhận"; statusColor = "text-green-600"; break;
              case "completed":
                statusLabel = "Đã khám"; statusColor = "text-blue-600"; break;
              case "cancelled":
                statusLabel = "Đã hủy"; statusColor = "text-red-600"; break;
              default:
                statusLabel = a.status; statusColor = "text-gray-600";
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
