import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_ALL_APPOINTMENTS,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        setAppointments(res.data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  const now = new Date();
  const filteredAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.date);

    if (statusFilter !== "all" && a.status !== statusFilter) return false;

    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      return (
        appointmentDate.getFullYear() === filterDate.getFullYear() &&
        appointmentDate.getMonth() === filterDate.getMonth() &&
        appointmentDate.getDate() === filterDate.getDate()
      );
    }

    if (!selectedMonth && appointmentDate < new Date(now.setHours(0, 0, 0, 0))) {
      return false;
    }

    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      return (
        appointmentDate.getFullYear() === parseInt(year) &&
        appointmentDate.getMonth() + 1 === parseInt(month)
      );
    }

    return true;
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-gray-700">
          Appointment List
        </h1>

        <div className="flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedMonth("");
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDate("");
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left border-b">ID</th>
            <th className="p-3 text-left border-b">Patient ID</th>
            <th className="p-3 text-left border-b">Date</th>
            <th className="p-3 text-left border-b">Time</th>
            <th className="p-3 text-left border-b">Status</th>
            <th className="p-3 text-left border-b">Room</th>
            <th className="p-3 text-left border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((a, index) => (
              <tr
                key={a.id}
                className="hover:bg-gray-50 border-b transition-colors"
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{a.Patient.name}</td>
                <td className="p-3">
                  {new Date(a.date).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-3">
                  {a.startTime} - {a.endTime}
                </td>
                <td
                  className={`p-3 font-medium ${
                    a.status === "confirmed"
                      ? "text-blue-600"
                      : a.status === "pending"
                      ? "text-yellow-600"
                      : a.status === "cancelled"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {a.status}
                </td>
                <td className="p-3">{a.roomId || "-"}</td>
                <td className="p-3">
                  <button className="text-sm text-blue-600 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}