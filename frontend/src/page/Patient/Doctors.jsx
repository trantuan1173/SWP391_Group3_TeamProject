import React, { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";
// Sidebar provided by PatientLayout

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Some environments may produce a malformed API string like ":1118/.."
        // Accept both absolute and port-prefixed forms. Normalize to a usable URL.
        let url = API_ENDPOINTS.DOCTOR_LIST || "/api/doctors";
        if (url.startsWith(":")) {
          url = `http://localhost${url}`; // ":1118/api/doctors" -> "http://localhost:1118/api/doctors"
        }
  // If axios instance has a baseURL, prefer relative paths; otherwise pass absolute URL.
  const absolute = /^https?:\/\//i.test(url);
  console.debug("[Doctors] fetching doctors from:", url, "(absolute:", absolute, ")");
  const res = await axios.get(absolute ? url : url);
        if (!cancelled) setDoctors(Array.isArray(res.data) ? res.data : res.data?.doctors || []);
      } catch (e) {
        console.error("Failed to load doctors", e);
        setError("Không thể tải danh sách bác sĩ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => (cancelled = true);
  }, []);

  const filtered = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return doctors.filter((d) => {
      if (statusFilter !== "all") {
        const isAvailable = d.isAvailable || d.status === "available" || d.status === "online";
        if (statusFilter === "available" && !isAvailable) return false;
        if (statusFilter === "busy" && isAvailable) return false;
      }
      if (!lower) return true;
      return (
        (d.name || "").toLowerCase().includes(lower) ||
        (d.speciality || "").toLowerCase().includes(lower) ||
        (d.degree || "").toLowerCase().includes(lower)
      );
    });
  }, [doctors, q, statusFilter]);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Danh sách bác sĩ</h2>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên"
            className="px-3 py-2 rounded-lg border w-80"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border">
            <option value="all">Tất cả</option>
            <option value="available">Sẵn sàng</option>
            <option value="busy">Bận</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded shadow-sm flex items-center justify-between animate-pulse">
                <div className="space-y-2 w-3/4">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Không tìm thấy bác sĩ phù hợp.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="p-4 border rounded-lg shadow-sm flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={d.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%239ca3af' font-size='18' font-family='Arial'>Dr</text></svg>"}
                    alt={d.name || 'Bác sĩ'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%239ca3af' font-size='18' font-family='Arial'>Dr</text></svg>";
                    }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-lg">{d.name || 'Bác sĩ'}</div>
                  <div className="text-sm text-gray-600">{d.speciality}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm ${d.isActive ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                  {d.isActive ? 'Bận' : 'Sẵn sàng'}
                </div>
              </div>
          </div>
        ))}
      </div>
    </main>
  );
}
