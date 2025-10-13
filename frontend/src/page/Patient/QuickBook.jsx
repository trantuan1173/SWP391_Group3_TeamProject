import React, { useState } from 'react';
import Header from '../../components/guestlayout/Header';
import { API_ENDPOINTS } from '../../config';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function QuickBook() {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !startTime) return setMessage('Vui lòng chọn ngày và giờ');

    const payload = {
      patientId: user?.id,
      date,
      startTime,
      endTime: '',
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.CREATE_APPOINTMENT, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert('Đặt lịch thành công');
    } catch (err) {
      console.error(err);
      setMessage('Đặt lịch thất bại');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f6fff4] pt-8 px-4">
        <div className="max-w-4xl mx-auto rounded-xl bg-[#f6fff4] p-6 md:p-8 mt-[30px]">
          <h2 className="text-2xl font-bold mb-6">Quick booking for {user?.name || 'Patient'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow">
                <div className="text-sm text-gray-500">Patient</div>
                <div className="text-lg font-semibold">{user?.name}</div>
                <div className="text-sm text-gray-500">{user?.phoneNumber}</div>
              </div>
            </div>

            <form className="md:col-span-1 bg-[#ede9fe] rounded-2xl p-6" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-base mb-1">Ngày</label>
                <input type="date" className="w-full border-2 border-purple-400 rounded-lg px-4 py-2 text-lg focus:outline-none" value={date} onChange={e=>setDate(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-base mb-1">Giờ</label>
                <input type="time" className="w-full border-2 border-purple-400 rounded-lg px-4 py-2 text-lg focus:outline-none" value={startTime} onChange={e=>setStartTime(e.target.value)} />
              </div>
              {message && <div className="text-red-500 mb-2">{message}</div>}
              <button type="submit" className="w-full bg-green-900 text-white py-2 rounded-full">Đặt lịch</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
