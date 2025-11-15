import React, { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { API_ENDPOINTS } from "../../config";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        let url = API_ENDPOINTS.DOCTOR_LIST || "/api/doctors";
        if (url.startsWith(":")) {
          url = `http://localhost${url}`;
        }
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
    return () => {
      cancelled = true;
    };
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

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedDoctors = filtered.slice(startIdx, endIdx);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, statusFilter, pageSize]);

  const getPageNumbers = () => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([
      1,
      2,
      totalPages - 1,
      totalPages,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
    ]);
    const inRange = [...pages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < inRange.length; i++) {
      result.push(inRange[i]);
      if (i < inRange.length - 1 && inRange[i + 1] - inRange[i] > 1) {
        result.push("...");
      }
    }
    return result;
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Danh sách bác sĩ</h2>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, chuyên khoa..."
            className="px-3 py-2 rounded-lg border w-80"
          />
          {/* Optional page size control */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border"
            title="Số dòng mỗi trang"
          >
            {[6, 8, 12, 16, 24].map((n) => (
              <option key={n} value={n}>
                {n}/trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 border rounded shadow-sm flex items-center justify-between animate-pulse"
              >
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

      {!loading && totalItems === 0 && (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">
          Không tìm thấy bác sĩ phù hợp.
        </div>
      )}

      {!loading && totalItems > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedDoctors.map((d) => (
              <div
                key={d.id}
                className="p-4 border rounded-lg shadow-sm flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={
                        d.avatar ||
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%239ca3af' font-size='18' font-family='Arial'>Dr</text></svg>"
                      }
                      alt={d.name || "Bác sĩ"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' fill='%239ca3af' font-size='18' font-family='Arial'>Dr</text></svg>";
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{d.name || "Bác sĩ"}</div>
                    <div className="text-sm text-gray-600">{d.speciality}</div>
                    <div className="text-xs text-gray-500 mt-1">{d.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
              {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : ''}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Tiếp</button>
          </div>
        </>
      )}
    </main>
  );
}
