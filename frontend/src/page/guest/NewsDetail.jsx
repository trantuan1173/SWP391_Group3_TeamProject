import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.GET_NEWS_BY_ID(id));
      setNews(res.data);
    } catch (error) {
      console.error("Failed to fetch news detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="animate-spin text-blue-600 w-12 h-12" />
        </div>
        <Footer />
      </>
    );
  }

  if (!news) {
    return (
      <>
        <Header />
        <div className="text-center py-20 text-gray-500 text-lg">
          Không tìm thấy bài viết.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">{news.title}</h1>

        <p className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-blue-600">Tag:</span> {news.tag}
        </p>

        {news.image && (
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-72 object-cover rounded-lg mb-6"
          />
        )}

        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: news.content }}
        ></div>
      </div>
      <Footer />
    </>
  );
};

export default NewsDetail;