import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { View, Pencil, LoaderCircle } from "lucide-react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";
import { useNavigate } from "react-router-dom";


const News = () => {
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8;
    const [totalItems, setTotalItems] = useState(0);
    const navigate = useNavigate();

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_ENDPOINTS.GET_NEWS, {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchTerm || "",
                },
            });

            setNews(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotalItems(res.data.totalItems);
        } catch (error) {
            console.error("Failed to fetch news:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [currentPage, searchTerm]);


    const paginatedNews = news;


    return (
        <>
            <Header />
            <div className="p-12">

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoaderCircle className="animate-spin text-blue-600 w-12 h-12" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-12">
                        {paginatedNews.map((item) => (
                            <div key={item.id} className="border p-4 rounded-md flex flex-col"
                                onClick={() => navigate(`/news/${item.id}`)}>
                                <div className="flex justify-between">
                                    <h4 className="text-lg font-bold" onClick={() => navigate(`/news/${item.id}`)}>{item.title}</h4>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">Tag: {item.tag}</p>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-32 object-cover my-2 rounded"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded ${currentPage === 1
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
                    className={`px-4 py-2 rounded ${currentPage === totalPages || totalPages === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    Next
                </button>
            </div>
            <Footer />
        </>
    );
};

export default News;