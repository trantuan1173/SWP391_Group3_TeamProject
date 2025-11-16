import React, { useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useParams } from "react-router-dom";

export default function BookPage() {
  const { id } = useParams();
  const [bookingDate, setBookingDate] = useState("");
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const localToday = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
      <h2 className="text-xl font-bold mb-4">Đặt lịch khám</h2>
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
            const payload = { patientId: id, date: bookingDate, startTime: bookingStartTime, endTime: "" };
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.post(API_ENDPOINTS.CREATE_APPOINTMENT, payload, { headers });
            setBookingMessage("Đặt lịch thành công");
            setBookingDate("");
            setBookingStartTime("");
          } catch (err) {
            setBookingMessage("Đặt lịch thất bại");
          } finally {
            setBookingLoading(false);
          }
        }}
      >
        <div className="mb-3">
          <label className="block text-gray-700 text-sm mb-1">Ngày</label>
          <input
            type="date"
            min={localToday}
            className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none ${!bookingDate && bookingMessage ? 'border-green-500' : 'border-purple-400'}`}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 text-sm mb-1">Giờ</label>
          <input
            type="time"
            min="07:00"
            max="17:00"
            step="1800"
            value={bookingStartTime}
            onChange={(e) => setBookingStartTime(e.target.value)}
            className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none ${!bookingStartTime && bookingMessage ? 'border-green-500' : 'border-purple-400'}`}
          />
        </div>
        {bookingMessage && <div className="text-sm text-green-600 mb-2">{bookingMessage}</div>}
        <button type="submit" disabled={bookingLoading} className="w-full bg-green-900 text-white py-2 rounded-full">{bookingLoading ? 'Đang gửi...' : 'Đặt lịch'}</button>
      </form>
    </div>
  );
}
