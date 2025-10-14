import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { View, Pencil } from "lucide-react";

const ReceptionistNews = () => {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({
    title: "",
    image: "",
    tag: "",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);

  const itemsPerPage = 8;
  const token = localStorage.getItem("token");

  // Convert file to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Fetch all news
  const fetchNews = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.GET_NEWS);
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNews(sorted);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Create or Update news
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image;
      if (file) {
        imageUrl = await fileToBase64(file);
      }

      const payload = {
        title: form.title.trim(),
        tag: form.tag.trim(),
        content: form.content.trim(),
        image: imageUrl,
      };

      if (editingNewsId) {
        await axios.put(API_ENDPOINTS.UPDATE_NEWS(editingNewsId), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("News updated successfully!");
      } else {
        await axios.post(API_ENDPOINTS.CREATE_NEWS, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("News created successfully!");
      }

      setForm({ title: "", image: "", tag: "", content: "" });
      setFile(null);
      setModalOpen(false);
      setEditingNewsId(null);
      fetchNews();
    } catch (error) {
      console.error("Failed to submit news:", error);
      alert("Failed to submit news!");
    } finally {
      setLoading(false);
    }
  };

  // Edit existing news
  const handleEditNews = (news) => {
    setEditingNewsId(news.id); // Set ID first to avoid race condition
    setForm({
      title: news.title,
      tag: news.tag,
      content: news.content,
      image: news.image,
    });
    setFile(null);
    setModalOpen(true);
  };

  // Delete news
  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;
    try {
      await axios.delete(API_ENDPOINTS.DELETE_NEWS(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("News deleted successfully!");
      setModalOpen(false);
      fetchNews();
    } catch (error) {
      console.error("Failed to delete news:", error);
      alert("Failed to delete news!");
    }
  };

  // Filtering + Pagination
  const filteredNews = news.filter((item) => {
    const matchesTitle = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag = filterTag ? item.tag === filterTag : true;
    return matchesTitle && matchesTag;
  });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const uniqueTags = Array.from(
    new Set(news.map((item) => item.tag))
  ).filter((tag) => tag);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">News Management</h2>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <button
          onClick={() => {
            setEditingNewsId(null);
            setForm({ title: "", image: "", tag: "", content: "" });
            setFile(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create News
        </button>

        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded flex-grow max-w-xs"
        />

        <select
          value={filterTag}
          onChange={(e) => {
            setFilterTag(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Tags</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {paginatedNews.map((item) => (
          <div key={item.id} className="border p-4 rounded-md flex flex-col">
            <div className="flex justify-between">
              <h4 className="text-lg font-bold">{item.title}</h4>
              <div className="flex gap-2">
                <View className="cursor-pointer text-gray-600 hover:text-blue-600" />
                <Pencil
                  className="cursor-pointer text-gray-600 hover:text-blue-600"
                  onClick={() => handleEditNews(item)}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Tag: {item.tag}</p>
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-32 object-cover my-2 rounded"
            />
            <p className="flex-grow">{item.content}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity animate-fadeIn"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10 animate-slideUp">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
              aria-label="Close modal"
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>

            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              {editingNewsId ? "Edit News" : "Create News"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter news title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  placeholder="Enter tag"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  placeholder="Write content here..."
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg outline-none transition"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Saving..."
                  : editingNewsId
                  ? "Update News"
                  : "Create News"}
              </button>

              {editingNewsId && (
                <button
                  type="button"
                  onClick={() => handleDeleteNews(editingNewsId)}
                  className="w-full py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                >
                  Delete News
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistNews;