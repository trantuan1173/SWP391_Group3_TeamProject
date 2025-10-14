import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PatientOnly() {
  const { user, loading } = useAuth();
  const params = useParams();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // If logged-in user is a patient, ensure they can only access their own id
  const userId = user.id || user.ID || user.patientId;
  if (userId && params.id && parseInt(userId) !== parseInt(params.id)) {
    // Instead of redirecting to home, show a friendly forbidden message.
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
