import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useAuth } from "../../context/AuthContext";

export default function PatientDashboard() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Appointments");
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);


  // helpers for records UI
  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch (e) {
      return dateStr || "-";
    }
  }

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

  function getAttachmentUrl(record) {
    if (!record) return null;
    if (record.attachment) return record.attachment;
    if (record.attachments && record.attachments.length) return record.attachments[0].url || record.attachments[0];
    if (record.files && record.files.length) return record.files[0].url || record.files[0];
    return null;
  }

  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      try {
        const res = await axios.get(API_ENDPOINTS.PATIENT_BY_ID(id));
        const data = res.data;
        setPatient(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPatient();
  }, [id]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id), { headers });
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : (data && Array.isArray(data.appointments) ? data.appointments : []));
      } catch (err) {
        console.error("Lỗi tải lịch khám:", err);
        setAppointments([]);
      }
    }
    if (id) fetchAppointments();
  }, [id]);

  async function cancelAppointment(appointmentId) {
    if (!appointmentId) return;
    try {
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a)));
      const res = await axios.put(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId), { status: 'cancelled' });
      if (res && res.data) {
        setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? res.data : a)));
      }
    } catch (err) {
      console.error('Failed to cancel appointment', err);
      try {
        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id));
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
      } catch (e) {
        console.error('Failed to reload appointments after cancel error', e);
      }
    }
  }

  useEffect(() => {
    if (patient) {
      const docs = patient.documents || patient.prescriptions || [];
      setMedicalRecords(Array.isArray(docs) ? docs : []);
    }
  }, [patient]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg animate-pulse">
          Đang tải dữ liệu bệnh nhân...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <a
            href="/"
            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
          >
            Quay về trang chủ
          </a>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 mt-10 mb-10">
        <div className="flex items-center gap-6 mb-8">
          <img
            src={patient?.avatar || "/icon/logo.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-green-200 shadow"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-green-700 mb-2">{patient?.name || "Tên bệnh nhân"}</h2>
            <div className="text-gray-600 text-lg">{patient?.email || "Email"}</div>
            <div className="text-gray-500 text-sm mt-1">Ngày sinh: {patient?.dateOfBirth ? formatDate(patient.dateOfBirth) : "-"}</div>
            <div className="mt-4">
              <a
                href={`/patient/${patient?.id}/profile`}
                className="inline-block bg-green-600 text-white px-5 py-2 rounded-full shadow hover:bg-green-700 transition font-semibold"
              >
                Xem hồ sơ & chỉnh sửa
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-purple-50 rounded-2xl p-6 shadow flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Tổng hồ sơ y tế</div>
            <div className="text-3xl font-bold text-purple-700">{medicalRecords.length}</div>
            <div className="text-xs text-gray-500 mt-2">Mới nhất: {medicalRecords[0] ? formatDate(medicalRecords[0].createdAt || medicalRecords[0].date) : "-"}</div>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-6 shadow flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Vai trò</div>
            <div className="text-2xl font-bold text-yellow-700">Bệnh nhân</div>
            <div className="text-xs text-gray-500 mt-2">ID: {patient?.id || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

