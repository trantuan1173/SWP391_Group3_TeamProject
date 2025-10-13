import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useParams } from "react-router-dom";
// Sidebar now provided by PatientLayout
import PatientInfo from "./components/PatientInfo";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useAuth } from "../../context/AuthContext";
// documents UI implemented inline below (no separate file)

export default function PatientDashboard() {
  const { id } = useParams();
  // unified single-page view (appointments + records)
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
    // try common fields
    if (!record) return null;
    if (record.attachment) return record.attachment;
    if (record.attachments && record.attachments.length) return record.attachments[0].url || record.attachments[0];
    if (record.files && record.files.length) return record.files[0].url || record.files[0];
    return null;
  }

  // Lấy thông tin bệnh nhân
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

  // Lấy lịch khám
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id));
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : (data && Array.isArray(data.appointments) ? data.appointments : []));
      } catch (err) {
        console.error("Lỗi tải lịch khám:", err);
        setAppointments([]);
      }
    }
    if (id) fetchAppointments();
  }, [id]);

  // Cancel appointment
  async function cancelAppointment(appointmentId) {
    if (!appointmentId) return;
    try {
      // optimistic update: mark as cancelled locally
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a)));
      const res = await axios.put(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId), { status: 'cancelled' });
      // update with server response if provided
      if (res && res.data) {
        setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? res.data : a)));
      }
    } catch (err) {
      console.error('Failed to cancel appointment', err);
      // revert by re-fetching appointments
      try {
        const res = await axios.get(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT(id));
        const data = res.data;
        setAppointments(Array.isArray(data) ? data : data.appointments || []);
      } catch (e) {
        console.error('Failed to reload appointments after cancel error', e);
      }
    }
  }

  // Lấy lịch sử khám (hồ sơ y tế)
  // Populate medical records from the patient details returned by /api/patients/:id
  useEffect(() => {
    if (patient) {
      // patient may include `documents` or `prescriptions` as arrays per backend
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
    <div className="flex-1 flex flex-col rounded-l-3xl overflow-hidden h-full">
        <header className="bg-white px-8 py-4 shadow flex items-center justify-between">
          <div className="flex items-center border rounded-full overflow-hidden w-[420px] bg-gray-50">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
            />
          </div>
          <div className="w-10 h-10 border rounded-full flex items-center justify-center bg-gray-50">
            <Clock size={20} className="text-gray-600" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 items-start">
            <div className="lg:col-span-3">
              <PatientInfo patient={patient} onUpdate={(p) => setPatient(p)} className="shadow-sm" />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm h-36 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-gray-400">Total Appointments</div>
                  <div className="text-2xl font-bold text-green-700">{Array.isArray(appointments) ? appointments.length : 0}</div>
                </div>
                <div className="text-xs text-gray-500">Last: {Array.isArray(appointments) && appointments[0] ? formatDateTime(appointments[0].date) : "-"}</div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm h-36 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-gray-400">Medical Records</div>
                  <div className="text-2xl font-bold text-purple-700">{medicalRecords.length}</div>
                </div>
                <div className="text-xs text-gray-500">Latest: {medicalRecords[0] ? formatDate(medicalRecords[0].createdAt || medicalRecords[0].date) : "-"}</div>
              </div>
            </div>
          </div>

          {/* Tabs: Appointments / Records / Book */}
          <div className="mb-6 flex justify-center lg:justify-start gap-3">
            {[
              { key: 'Appointments', label: 'Lịch khám' },
              { key: 'Records', label: 'Hồ sơ y tế' },
              { key: 'Book', label: 'Đặt lịch' },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-shadow ${activeTab===t.key? 'bg-green-600 text-white shadow' : 'bg-white text-gray-700 hover:shadow-sm'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {activeTab === 'Appointments' && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Lịch khám</h3>
                {appointments.length === 0 ? (
                  <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Chưa có lịch khám.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.map((a) => {
                      const { day, month } = formatDayMonth(a.date);
                      return (
                        <div key={a.id} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-green-50 flex flex-col items-center justify-center text-green-700">
                            <div className="text-lg font-bold">{day}</div>
                            <div className="text-xs">{month}</div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{a.Employee?.name || a.doctorName || "Chưa rõ bác sĩ"}</div>
                            <div className="text-sm text-gray-500">{formatDateTime(a.date)}</div>
                            <div className="text-sm text-gray-500">{a.startTime} — {a.endTime} • {a.Room?.name || 'N/A'}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`text-sm font-medium ${a.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>{a.status === 'cancelled' ? 'Đã hủy' : a.status}</div>
                            {!(a.status === 'cancelled' || a.status === 'completed') ? (
                              <button
                                onClick={async () => {
                                  if (!confirm('Bạn có chắc muốn hủy lịch này?')) return;
                                  await cancelAppointment(a.id);
                                }}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Hủy
                              </button>
                            ) : (
                              <div className="text-xs text-gray-500">{a.status === 'cancelled' ? 'Đã hủy' : 'Hoàn tất'}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'Records' && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Hồ sơ y tế</h3>
                {medicalRecords.length === 0 ? (
                  <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Chưa có hồ sơ y tế.</div>
                ) : (
                  <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">Ngày</th>
                          {/* <th className="px-4 py-3 text-left">Bác sĩ</th> */}
                          <th className="px-4 py-3 text-left">Tóm tắt</th>
                         </tr>
                      </thead>
                      <tbody>
                        {medicalRecords.map((d, i) => (
                          <tr key={d.id || i} className="border-t">
                            <td className="px-4 py-3 align-top">{d.createdAt ? formatDateTime(d.createdAt) : '-'}</td>
                            {/* <td className="px-4 py-3 align-top">{d.Doctor?.Employee?.name || d.doctorName || '-'}</td> */}
                            <td className="px-4 py-3 align-top">
                              <div className="font-medium">{d.treatment || d.diagnosis || 'Không có thông tin'}</div>
                              {d.notes && <div className="text-xs text-gray-500 mt-1">{d.notes}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'Book' && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Đặt lịch</h3>
                <div className="bg-[#ede9fe] rounded-2xl p-6 max-w-md">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBookingMessage("");
                      if (!bookingDate || !bookingStartTime) {
                        setBookingMessage("Vui lòng chọn ngày và giờ");
                        return;
                      }
                      setBookingLoading(true);
                      try {
                        const token = localStorage.getItem("token");
                        const payload = { date: bookingDate, startTime: bookingStartTime, endTime: "" };
                        const headers = token ? { Authorization: `Bearer ${token}` } : {};
                        const res = await axios.post(API_ENDPOINTS.CREATE_APPOINTMENT, payload, { headers });
                        if (res.data && res.data.appointment) {
                          setAppointments((prev) => [res.data.appointment, ...prev]);
                        } else if (res.data) {
                          setAppointments((prev) => [res.data, ...prev]);
                        }
                        setBookingMessage("Đặt lịch thành công");
                        setBookingDate("");
                        setBookingStartTime("");
                      } catch (err) {
                        console.error(err);
                        setBookingMessage("Đặt lịch thất bại");
                      } finally {
                        setBookingLoading(false);
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm mb-1">Ngày</label>
                      <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full border-2 border-purple-400 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-700 text-sm mb-1">Giờ</label>
                      <input type="time" value={bookingStartTime} onChange={(e) => setBookingStartTime(e.target.value)} className="w-full border-2 border-purple-400 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    {bookingMessage && <div className="text-sm text-red-600 mb-2">{bookingMessage}</div>}
                    <button type="submit" disabled={bookingLoading} className="w-full bg-green-900 text-white py-2 rounded-full">{bookingLoading ? 'Đang gửi...' : 'Đặt lịch'}</button>
                  </form>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
  );
}

