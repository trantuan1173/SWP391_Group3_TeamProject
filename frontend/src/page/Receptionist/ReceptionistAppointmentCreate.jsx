import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { useNavigate } from "react-router-dom";

function FormInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium">{label}</label>
      <input
        {...props}
        className={`border px-3 py-2 rounded w-full ${props.disabled ? "bg-gray-100" : ""}`}
      />
      {props.error && <span className="text-red-500 text-sm">{props.error}</span>}
    </div>
  );
}

function FormSelect({ label, children, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium">{label}</label>
      <select
        {...props}
        className="border px-3 py-2 rounded w-full"
      >
        {children}
      </select>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}

export default function ReceptionistAppointmentCreate() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorAvailable, setDoctorAvailable] = useState(true);
  const [form, setForm] = useState({
    patientId: "",
    name: "",
    phoneNumber: "",
    identityNumber: "",
    gender: "",
    doctorId: "",
    roomId: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "confirmed",
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_ALL_PATIENTS_FOR_RECEPTIONIST, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (Array.isArray(res.data.data)) setPatients(res.data.data);
        else setPatients([]);
      } catch {
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.DOCTOR_LIST, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDoctors(res.data || res.data.data || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.ROOM_LIST, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) setRooms(res.data);
        else if (Array.isArray(res.data.data)) setRooms(res.data.data);
        else setRooms([]);
      })
      .catch(() => setRooms([]));
  }, []);

  useEffect(() => {
    if (form.patientId) {
      const selected = patients.find(
        (p) => String(p.id) === String(form.patientId)
      );
      if (selected) {
        setForm((f) => ({
          ...f,
          patientId: form.patientId,
          name: selected.name || "",
          phoneNumber: selected.phoneNumber || "",
          identityNumber: selected.identityNumber || "",
          gender: selected.gender || "",
        }));
      }
    } else {
      setForm((f) => ({
        ...f,
        patientId: "",
        name: "",
        phoneNumber: "",
        identityNumber: "",
        gender: "",
      }));
    }
  }, [form.patientId, patients]);

  useEffect(() => {
    async function checkDoctorAvailable() {
      if (
        !form.doctorId ||
        !form.date ||
        !form.startTime ||
        !form.endTime
      ) {
        setDoctorAvailable(true);
        return;
      }
      try {
        const res = await axios.get(API_ENDPOINTS.GET_AVAILABLE_DOCTORS, {
          params: {
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const availableIds = res.data.availableDoctors?.map((d) => String(d.id)) || [];
        setDoctorAvailable(availableIds.includes(String(form.doctorId)));
      } catch {
        setDoctorAvailable(true);
      }
    }
    checkDoctorAvailable();
  }, [form.date, form.startTime, form.endTime, form.doctorId]);

  function validate() {
    const newErrors = {};
    if (!form.name) newErrors.name = "Vui lòng nhập tên";
    if (!form.phoneNumber || !/^\d{10}$/.test(form.phoneNumber))
      newErrors.phoneNumber = "Số điện thoại phải đủ 10 số";
    if (!form.identityNumber || !/^\d{12}$/.test(form.identityNumber))
      newErrors.identityNumber = "CCCD phải đủ 12 số";
    if (!form.date) newErrors.date = "Chọn ngày khám";
    if (!form.startTime) newErrors.startTime = "Chọn giờ bắt đầu";
    if (!form.endTime) newErrors.endTime = "Chọn giờ kết thúc";
    if (!form.doctorId) newErrors.doctorId = "Chọn bác sĩ";
    if (!doctorAvailable)
      newErrors.doctorId =
        "Bác sĩ đã có lịch trong khoảng thời gian này. Vui lòng chọn thời gian khác hoặc bác sĩ khác!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let patientId = form.patientId;
      if (!patientId) {
        const res = await axios.post(
          API_ENDPOINTS.CREATE_PATIENT,
          {
            name: form.name,
            phoneNumber: form.phoneNumber,
            identityNumber: form.identityNumber,
            gender: form.gender,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        patientId = res.data.patient?.id || res.data.id;
      }
      await axios.post(
        API_ENDPOINTS.CREATE_APPOINTMENT,
        {
          patientId,
          doctorId: form.doctorId,
          roomId: form.roomId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          status: "confirmed",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Tạo lịch thành công!");
      navigate("/receptionist/appointments");
    } catch (err) {
      alert("Có lỗi xảy ra: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  }

  const filteredPatients = search.trim() === ""
    ? patients
    : patients.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
          (p.phoneNumber && p.phoneNumber.includes(search))
      );
  const isDisabled = !!form.patientId;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Đăng ký lịch khám</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Tìm tên hoặc số điện thoại"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Nhập tên hoặc số điện thoại để tìm nhanh"
        />
        <FormSelect
          label="Bệnh nhân"
          value={form.patientId}
          onChange={e =>
            setForm((f) => ({
              ...f,
              patientId: e.target.value,
            }))
          }
        >
          <option value="">-- Bệnh nhân mới --</option>
          {filteredPatients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.phoneNumber}
            </option>
          ))}
        </FormSelect>
        <FormInput
          label="Họ tên"
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          disabled={isDisabled}
          error={errors.name}
        />
        <FormInput
          label="Số điện thoại"
          type="text"
          value={form.phoneNumber}
          onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
          disabled={isDisabled}
          error={errors.phoneNumber}
        />
        <FormInput
          label="CCCD"
          type="text"
          value={form.identityNumber}
          onChange={e => setForm(f => ({ ...f, identityNumber: e.target.value }))}
          disabled={isDisabled}
          error={errors.identityNumber}
        />
          <FormSelect
            label="Giới tính"
            value={form.gender || ""}
            onChange={e => setForm(f => ({ ...f, gender: e.target.value || null }))}
            disabled={isDisabled}
          >
          <option value="">-- Chọn giới tính --</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
        </FormSelect>
        <FormSelect
          label="Bác sĩ"
          value={form.doctorId}
          onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
          error={errors.doctorId}
        >
          <option value="">-- Chọn bác sĩ --</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} - {d.speciality}
            </option>
          ))}
        </FormSelect>
        {!doctorAvailable && (
          <span className="text-red-500 text-sm">
            Bác sĩ đã có lịch trong khoảng này!
          </span>
        )}
        <FormSelect
          label="Phòng"
          value={form.roomId}
          onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
        >
          <option value="">-- Chọn phòng --</option>
          {(Array.isArray(rooms) ? rooms : []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} - {r.type}
            </option>
          ))}
        </FormSelect>
        <FormInput
          label="Ngày khám"
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          error={errors.date}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Giờ bắt đầu"
            type="time"
            value={form.startTime}
            onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
            error={errors.startTime}
          />
          <FormInput
            label="Giờ kết thúc"
            type="time"
            value={form.endTime}
            onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
            error={errors.endTime}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition ${loading && "opacity-50 cursor-not-allowed"}`}
          disabled={loading}
        >
          {loading ? "Đang tạo..." : "Tạo lịch"}
        </button>
      </form>
    </div>
  );
}
