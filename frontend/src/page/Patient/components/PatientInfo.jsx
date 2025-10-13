import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "../../../lib/axios";
import { API_ENDPOINTS } from "../../../config";

export default function PatientInfo({ patient, onUpdate }) {
  if (!patient) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 text-center text-gray-500">
        Không có thông tin bệnh nhân.
      </div>
    );
  }

  // Tính tuổi từ dateOfBirth
  const calcAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-start gap-6">
        {/* Patient Avatar */}
        {/* <div className="w-[260px] h-[158px] rounded-[24px] overflow-hidden bg-gray-200">
          <img
            src={
              patient.avatar
                ? `http://localhost:1118/uploads/avatars/${patient.avatar.replace(
                    "/uploads/avatars/",
                    ""
                  )}`
                : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='158'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%239ca3af' font-size='28' font-family='Arial'>No Image</text></svg>"
            }
            alt={patient.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='158'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%239ca3af' font-size='28' font-family='Arial'>No Image</text></svg>";
            }}
          />
        </div> */}

        {/* Patient Info */}
        <div className="flex-1">
          <EditableProfile patient={patient} onUpdate={onUpdate} />
          <div className="text-sm text-gray-700 space-y-1">
            {/* <div>
              <span className="font-bold">Age:</span>{" "}
              {calcAge(patient.dateOfBirth)}
              <span className="ml-6 font-bold">Sex:</span>{" "}
              {patient.gender || "-"}
            </div> */}
            <div>
              <span className="font-bold">Phone:</span>{" "}
              {patient.phoneNumber || "-"}
            </div>
            <div>
              <span className="font-bold">E-mail:</span>{" "}
              {patient.email || "-"}
            </div>
       
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableProfile({ patient, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: patient.name || "",
    email: patient.email || "",
    phoneNumber: patient.phoneNumber || "",
    address: patient.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.put(API_ENDPOINTS.PATIENT_BY_ID(patient.id), form);
      if (res.data && res.data.patient) {
        onUpdate && onUpdate(res.data.patient);
      } else if (res.data) {
        onUpdate && onUpdate(res.data);
      }
      setMsg('Cập nhật thành công');
      setEditing(false);
    } catch (e) {
      console.error('Update patient failed', e);
      setMsg('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  if (!editing) return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="font-bold text-lg">{patient.name}</h2>
      <div className="flex gap-2">
        {/* <button onClick={() => setEditing(true)} className="text-sm px-3 py-1 rounded bg-green-600 text-white">Chỉnh sửa</button> */}
        <button onClick={() => navigate(`/patient/${patient.id}/profile`)} className="text-sm px-3 py-1 rounded border">Xem hồ sơ</button>
      </div>
    </div>
  );

  return (
    <div className="mb-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={form.name} onChange={handleChange('name')} className="border px-3 py-2 rounded" placeholder="Họ và tên" />
        <input value={form.email} onChange={handleChange('email')} className="border px-3 py-2 rounded" placeholder="Email" />
        <input value={form.phoneNumber} onChange={handleChange('phoneNumber')} className="border px-3 py-2 rounded" placeholder="Số điện thoại" />
        <input value={form.address} onChange={handleChange('address')} className="border px-3 py-2 rounded" placeholder="Địa chỉ" />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={save} disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? 'Đang lưu...' : 'Lưu'}</button>
        <button onClick={() => { setEditing(false); setMsg(null); }} className="px-4 py-2 rounded border">Hủy</button>
        {msg && <div className="text-sm text-gray-600 ml-3">{msg}</div>}
      </div>
    </div>
  );
}