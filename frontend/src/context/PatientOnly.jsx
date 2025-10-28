import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PatientOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Defensive logging for debugging (can be removed later)
  try {
    console.log('[PatientOnly] loading=', loading, 'user=', user, 'pathname=', location.pathname);
  } catch (e) {
    // ignore logging errors
  }

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Robust user id extraction from different possible shapes
  const userId =
    (user && (user.id || user.ID || user.userId || user.patientId || user.patient_id)) || null;

  // If the logged user is an employee, allow through
  if (user && user.role && typeof user.role === 'string' && /employee|admin|receptionist|doctor/i.test(user.role)) {
    return <Outlet />;
  }

  // Parse pathname and find numeric segment after the 'patient' keyword
  const cleaned = String(location.pathname || '').replace(/^\/+/, '');
  const parts = cleaned.split('/').filter(Boolean); // ['patient','13','appointments']
  let patientIdFromPath = null;
  const patientIndex = parts.findIndex((p) => p.toLowerCase() === 'patient');
  if (patientIndex >= 0 && parts.length > patientIndex + 1) {
    const candidate = parts[patientIndex + 1];
    if (/^\d+$/.test(String(candidate))) patientIdFromPath = parseInt(candidate, 10);
  }

  // If there's a numeric patient id in the path, enforce ownership
  if (patientIdFromPath !== null && userId && parseInt(userId, 10) !== parseInt(patientIdFromPath, 10)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-700 mb-4">Bạn không có quyền xem trang của bệnh nhân này.</p>
          <Link to={`/patient/${userId}/appointments`} className="inline-block bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700">
            Về trang của tôi
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
