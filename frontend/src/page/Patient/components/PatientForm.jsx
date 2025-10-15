import React, { useState, useEffect } from 'react';
import axios from '../../../lib/axios';
import { API_ENDPOINTS } from '../../../config';

export default function PatientForm({ initial = {}, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm((s) => ({ ...s, ...initial }));
  }, [initial]);

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    if (!form.name || form.name.trim().length < 2) return 'Tên không hợp lệ';
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email không hợp lệ';
    if (form.phoneNumber && !/^[0-9+\-\s]{6,20}$/.test(form.phoneNumber)) return 'Số điện thoại không hợp lệ';
    return null;
  };

  const save = async (id) => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(API_ENDPOINTS.PATIENT_BY_ID(form.id || id), form);
      const data = res.data?.patient || res.data;
      onSaved && onSaved(data);
    } catch (e) {
      console.error('PatientForm save error', e);
      setError('Lưu thất bại, thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={form.name} onChange={handleChange('name')} placeholder="Họ và tên" className="border px-3 py-2 rounded" />
        <input value={form.email} onChange={handleChange('email')} placeholder="Email" className="border px-3 py-2 rounded" />
        <input value={form.phoneNumber} onChange={handleChange('phoneNumber')} placeholder="Số điện thoại" className="border px-3 py-2 rounded" />
        <input value={form.address} onChange={handleChange('address')} placeholder="Địa chỉ" className="border px-3 py-2 rounded" />
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600"></span>
          <input type="date" value={form.dateOfBirth ? form.dateOfBirth.slice(0,10) : ''} onChange={handleChange('dateOfBirth')} className="border px-3 py-2 rounded" />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => save(form.id)} disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? 'Đang lưu...' : 'Lưu'}</button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
