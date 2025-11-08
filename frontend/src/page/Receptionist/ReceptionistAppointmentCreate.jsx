import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { useNavigate } from "react-router-dom";

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
    gender: "male",
    doctorId: "",
    roomId: "",
    date: "",
    startTime: "",
    endTime: "",
    status: "confirmed",
  });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  // Hàm fetch bệnh nhân, dùng lại cho useEffect và onFocus
  const fetchPatients = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_ALL_PATIENTS_FOR_RECEPTIONIST, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (Array.isArray(res.data)) setPatients(res.data);
      else if (Array.isArray(res.data.data)) setPatients(res.data.data);
      else setPatients([]);
    } catch {
      setPatients([]);
    }
  };

  // Lấy danh sách bệnh nhân khi mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Lấy danh sách bác sĩ
  useEffect(() => {
    axios
      .get(API_ENDPOINTS.DOCTOR_LIST, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setDoctors(res.data || res.data.data || []))
      .catch(() => setDoctors([]));
  }, []);

  // Lấy danh sách phòng
  useEffect(() => {
    axios
      .get(API_ENDPOINTS.GET_AVAILABLE_ROOMS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setRooms(res.data || []))
      .catch(() => setRooms([]));
  }, []);

  // Khi chọn bệnh nhân, tự động điền thông tin và disable
  useEffect(() => {
    if (form.patientId) {
      const selected = patients.find(
        (p) => String(p.id) === String(form.patientId)
      );
      if (selected) {
        setForm((f) => ({
          ...f,
          name: selected.name || "",
          phoneNumber: selected.phoneNumber || "",
          identityNumber: selected.identityNumber || "",
          gender: selected.gender || "male",
        }));
      }
    } else {
      setForm((f) => ({
        ...f,
        name: "",
        phoneNumber: "",
        identityNumber: "",
        gender: "male",
      }));
    }
    // eslint-disable-next-line
  }, [form.patientId, patients]);

  // Kiểm tra bác sĩ rảnh khi chọn ngày/giờ/bác sĩ
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
      } catch (err) {
        setDoctorAvailable(true); // Không lỗi thì cho qua
      }
    }
    checkDoctorAvailable();
    // eslint-disable-next-line
  }, [form.date, form.startTime, form.endTime, form.doctorId]);

  // Validate
  function validate() {
    const newErrors = {};
    if (!form.name) newErrors.name = "Vui lòng nhập tên";
    if (!form.phoneNumber || !/^\d{10}$/.test(form.phoneNumber))
      newErrors.phoneNumber = "Số điện thoại phải đủ 10 số";
    if (!form.identityNumber || !/^\d{10}$/.test(form.identityNumber))
      newErrors.identityNumber = "CCCD phải đủ 10 số";
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

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let patientId = form.patientId;
      // Nếu là bệnh nhân mới
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

  const filteredPatients = patients.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.phoneNumber && p.phoneNumber.includes(search))
  );

  // Disable trường nếu chọn bệnh nhân cũ
  const isDisabled = !!form.patientId;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Đăng ký lịch khám</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ô tìm kiếm bệnh nhân */}
        <div>
          <input
            type="text"
            placeholder="Tìm tên hoặc số điện thoại"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-2 w-full mb-2"
          />
        </div>
        {/* Select danh sách bệnh nhân */}
        <div>
          <label className="block mb-1">Bệnh nhân:</label>
          <select
            value={form.patientId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                patientId: e.target.value,
              }))
            }
            onFocus={fetchPatients}
            className="border px-3 py-2 w-full"
          >
            <option value="">-- Bệnh nhân mới --</option>
            {filteredPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.phoneNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Họ tên:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            className="border px-3 py-2 w-full"
            disabled={isDisabled}
          />
          {errors.name && <span className="text-red-500">{errors.name}</span>}
        </div>
        <div>
          <label className="block mb-1">Số điện thoại:</label>
          <input
            type="text"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneNumber: e.target.value }))
            }
            className="border px-3 py-2 w-full"
            disabled={isDisabled}
          />
          {errors.phoneNumber && (
            <span className="text-red-500">{errors.phoneNumber}</span>
          )}
        </div>
        <div>
          <label className="block mb-1">CCCD:</label>
          <input
            type="text"
            value={form.identityNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, identityNumber: e.target.value }))
            }
            className="border px-3 py-2 w-full"
            disabled={isDisabled}
          />
          {errors.identityNumber && (
            <span className="text-red-500">{errors.identityNumber}</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Giới tính:</label>
          <select
            value={form.gender}
            onChange={(e) =>
              setForm((f) => ({ ...f, gender: e.target.value }))
            }
            className="border px-3 py-2 w-full"
            disabled={isDisabled}
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Bác sĩ:</label>
          <select
            value={form.doctorId}
            onChange={(e) =>
              setForm((f) => ({ ...f, doctorId: e.target.value }))
            }
            className="border px-3 py-2 w-full"
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} - {d.speciality}
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <span className="text-red-500">{errors.doctorId}</span>
          )}
          {!doctorAvailable && (
            <span className="text-red-500">
              Bác sĩ đã có lịch trong khoảng này!
            </span>
          )}
        </div>
        <div>
          <label className="block mb-1">Phòng:</label>
          <select
            value={form.roomId}
            onChange={(e) =>
              setForm((f) => ({ ...f, roomId: e.target.value }))
            }
            className="border px-3 py-2 w-full"
          >
            <option value="">-- Chọn phòng --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} - {r.type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Ngày khám:</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((f) => ({ ...f, date: e.target.value }))
            }
            className="border px-3 py-2 w-full"
          />
          {errors.date && (
            <span className="text-red-500">{errors.date}</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Giờ bắt đầu:</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, startTime: e.target.value }))
            }
            className="border px-3 py-2 w-full"
          />
          {errors.startTime && (
            <span className="text-red-500">{errors.startTime}</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Giờ kết thúc:</label>
          <input
            type="time"
            value={form.endTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, endTime: e.target.value }))
            }
            className="border px-3 py-2 w-full"
          />
          {errors.endTime && (
            <span className="text-red-500">{errors.endTime}</span>
          )}
        </div>
        <div>
          <label className="block mb-1">Trạng thái:</label>
          <input
            type="text"
            value="confirmed"
            disabled
            className="border px-3 py-2 w-full bg-gray-100"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Đang tạo..." : "Tạo lịch"}
        </button>
      </form>
    </div>
  );
}
