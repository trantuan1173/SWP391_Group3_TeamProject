import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiFilter, setApiFilter] = useState("today");
  const [searchPhone, setSearchPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const handleSearch = () => {
    fetchAppointments();
  };


  const fetchAppointments = async () => {
    try {
      let url =
        searchQuery.trim() !== ""
          ? API_ENDPOINTS.GET_ALL_APPOINTMENTS
          : apiFilter === "today"
            ? API_ENDPOINTS.GET_TODAY_APPOINTMENTS
            : API_ENDPOINTS.GET_ALL_APPOINTMENTS;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          search: searchQuery,
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });

      setAppointments(res.data.data || []);
      setTotalItems(res.data.totalItems || 0);
      setTotalPages(res.data.totalPages || 1);
      console.log(res.data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    if (searchQuery === "") {
      fetchAppointments();
    }
  }, [searchQuery]);
  useEffect(() => {
    fetchAppointments();
  }, [currentPage]);
  useEffect(() => {
    setCurrentPage(1);
    fetchAppointments();
  }, [statusFilter]);
  useEffect(() => {
    setCurrentPage(1);
    fetchAppointments();
  }, [apiFilter]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold text-gray-700">
          Appointment List
        </h1>

        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Search
          </button>
          <div>
            <label htmlFor="statusFilter" className="mr-2">Status:</label>
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
          </div>
          <select
            value={apiFilter}
            onChange={(e) => setApiFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left border-b">No.</th>
            <th className="p-3 text-left border-b">Patient</th>
            <th className="p-3 text-left border-b">Date</th>
            <th className="p-3 text-left border-b">Time</th>
            <th className="p-3 text-left border-b">Status</th>
            <th className="p-3 text-left border-b">Room</th>
            <th className="p-3 text-left border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((a, index) => (
              <tr
                key={a.id}
                className="hover:bg-gray-50 border-b transition-colors"
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{a.Patient?.name || "-"}</td>
                <td className="p-3">
                  {new Date(a.date).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-3">
                  {a.startTime} - {a.endTime}
                </td>
                <td
                  className={`p-3 font-medium ${a.status === "confirmed"
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
                <td className="p-3">{a.Room?.name || "-"}</td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/receptionist/appointments/${a.id}`)}
                    className="text-sm text-blue-600 hover:underline"
                  >
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

      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded ${currentPage === totalPages || totalPages === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}