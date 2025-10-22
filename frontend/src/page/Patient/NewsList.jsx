import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axios';
import { API_ENDPOINTS } from '../../config';

export default function PatientNewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const url = API_ENDPOINTS.GET_NEWS;
        console.log('[PatientNewsList] GET', url);
        const res = await axios.get(url);
        if (!mounted) return;
        console.log('[PatientNewsList] response', res);
        const data = res.data;
        // support multiple possible response shapes
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.news)) list = data.news;
        else if (data && Array.isArray(data.data)) list = data.data;
        else if (data && Array.isArray(data.results)) list = data.results;
        else if (data && Array.isArray(data.items)) list = data.items;
        else if (data && Array.isArray(data.payload)) list = data.payload;
        else list = [];
        console.log('[PatientNewsList] parsed list length=', list.length);
        setNews(list);
      } catch (e) {
        console.error('Failed to fetch news', e);
        if (mounted) setError('Không thể tải tin tức');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!news.length) return <div className="p-6">Chưa có tin tức.</div>;

  const totalPages = Math.ceil(news.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pageItems = news.slice(start, start + pageSize);

  const excerpt = (html, n = 120) => {
    if (!html) return '';
    // Strip HTML tags
    const txt = html.replace(/<[^>]*>/g, '');
    return txt.length > n ? txt.slice(0, n).trim() + '…' : txt;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tin tức</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageItems.map((n) => (
          <div key={n.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
            {n.image && (
              <img src={n.image} alt={n.title} className="w-full h-40 object-cover rounded-md mb-3" />
            )}
            <h3 className="text-lg font-semibold mb-2">{n.title}</h3>
            <p className="text-sm text-gray-600 flex-1">{excerpt(n.content)}</p>
            <div className="mt-4">
              <button onClick={() => navigate(`/patient/news/${n.id}`)} className="text-blue-600 hover:underline">Xem chi tiết</button>
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
    </div>
  );
}
