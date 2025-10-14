import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { API_ENDPOINTS } from '../../config';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.PATIENT_BY_ID(id));
        if (!mounted) return;
        setPatient(res.data?.patient || res.data);
      } catch (e) {
        console.error('Failed fetching patient', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!patient) return <div className="p-6">Không tìm thấy bệnh nhân</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hồ sơ bệnh nhân</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Quay lại</button>
          <button onClick={() => navigate(`/patient/${id}/edit`)} className="px-3 py-1 bg-green-600 text-white rounded">Chỉnh sửa</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <div className="text-sm font-semibold">Họ và tên</div>
            <div className="mt-1">{patient.name || '-'}</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Email</div>
            <div className="mt-1">{patient.email || '-'}</div>
          </div>

          <div>
            <div className="text-sm font-semibold">Số điện thoại</div>
            <div className="mt-1">{patient.phoneNumber || '-'}</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Địa chỉ</div>
            <div className="mt-1">{patient.address || '-'}</div>
          </div>

          <div>
            <div className="text-sm font-semibold">Ngày sinh</div>
            <div className="mt-1">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}</div>
          </div>
          <div>
            <div className="text-sm font-semibold">Giới tính</div>
            <div className="mt-1">{patient.gender || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
