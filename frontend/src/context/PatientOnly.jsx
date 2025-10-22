import React from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PatientOnly() {
  const { user, loading } = useAuth();
  const params = useParams();
  const location = useLocation();

  try {
    console.log('[PatientOnly] loading=', loading, 'user=', user, 'params=', params, 'pathname=', location.pathname);
  } catch (e) {
  }

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userId = user.id || user.ID || user.patientId;

  const cleaned = String(location.pathname || '').replace(/^\/+/, ''); 
  const parts = cleaned.split('/'); 
  const afterPatient = parts[1] || '';
  const isPatientSegmentNumeric = /^\d+$/.test(String(afterPatient));

  if (userId && isPatientSegmentNumeric && parseInt(userId, 10) !== parseInt(afterPatient, 10)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-700 mb-4">Bạn không có quyền xem trang của bệnh nhân này.</p>
          <a
            href={`/patient-dashboard/${userId}`}
            className="inline-block bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700"
          >
            Về trang của tôi
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
