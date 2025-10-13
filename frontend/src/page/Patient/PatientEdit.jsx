import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { API_ENDPOINTS } from '../../config';
import PatientForm from './components/PatientForm';

export default function PatientEdit() {
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
        console.error('Fetch patient failed', e);
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Chỉnh sửa hồ sơ</h1>
        <div>
          <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Quay lại</button>
        </div>
      </div>

      <PatientForm initial={patient} onSaved={(p) => {
        // After save, navigate back to patient dashboard
        navigate(`/patient/${id}`);
      }} />
    </div>
  );
}
