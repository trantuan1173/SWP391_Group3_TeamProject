import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
import { useParams } from "react-router-dom";

export default function MedicalRecordPage() {
  const { id } = useParams();
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await axios.get(API_ENDPOINTS.PATIENT_BY_ID(id));
        const data = res.data;
        const docs = data.documents || data.prescriptions || [];
        setMedicalRecords(Array.isArray(docs) ? docs : []);
      } catch (err) {
        setMedicalRecords([]);
      }
    }
    if (id) fetchRecords();
  }, [id]);

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

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Hồ sơ y tế</h2>
      {medicalRecords.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Chưa có hồ sơ y tế.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Tóm tắt</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map((d, i) => (
                <tr key={d.id || i} className="border-t">
                  <td className="px-4 py-3 align-top">{d.createdAt ? formatDateTime(d.createdAt) : '-'}</td>
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
    </div>
  );
}
