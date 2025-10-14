import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import axios from '../lib/axios';
import { API_ENDPOINTS } from '../config';

export default function PatientLayout() {
  const [patient, setPatient] = useState(null);

  // Try to load patient profile if available so sidebar can show avatar/name
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // If user is logged in, API may provide /api/users/profile
        const res = await axios.get(API_ENDPOINTS.AUTH_PROFILE).catch(() => null);
        if (!cancelled && res && res.data) setPatient(res.data.patient || res.data);
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => (cancelled = true);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar patient={patient} />
      <div className="flex-1 flex flex-col rounded-l-3xl overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
