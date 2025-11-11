// src/page/FAQ/FaqCategoryPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchFaqList } from "@/api/faqApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { User2 } from "lucide-react";
import Header from "@/components/guestlayout/Header";
import Footer from "@/components/guestlayout/Footer";

export default function FaqCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const categoryName = params.get("name") || "FAQ";
  const categoryId = Number(id);

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  async function loadFaqs() {
    if (!categoryId) return;
    try {
      setLoading(true);
      const data = await fetchFaqList({
        page,
        pageSize,
        search: "",
        categoryId,
      });
      setFaqs(Array.isArray(data.items) ? data.items : []);
      setTotalPages(Number(data.totalPages || 1));
      setTotalItems(Number(data.total || 0));
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, page, pageSize]);

  const onChangePage = (next) => {
    if (next === page || next < 1 || next > totalPages) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalItems);

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  <button
                    className="hover:underline"
                    onClick={() => navigate(-1)}
                  >
                    Help Center
                  </button>{" "}
                  / <span className="font-medium">{categoryName}</span>
                </div>
                <h1 className="text-2xl font-bold">{categoryName}</h1>
              </div>

              {/* chọn pageSize đơn giản */}
              <div className="ml-auto">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border rounded-md p-2 text-sm"
                >
                  <option value="6">6 / trang</option>
                  <option value="9">9 / trang</option>
                  <option value="12">12 / trang</option>
                  <option value="18">18 / trang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-end justify-between mb-2">
            <h2 className="text-xl font-semibold">Các câu hỏi thường gặp</h2>
            {!loading && totalItems > 0 && (
              <div className="text-sm text-gray-500">
                Hiển thị {startIdx}-{endIdx} / {totalItems}
              </div>
            )}
          </div>

          {/* Grid cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <Card>
                <CardContent className="p-4 text-gray-500">
                  Đang tải…
                </CardContent>
              </Card>
            )}

            {!loading && faqs.length === 0 && (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="p-6 text-gray-500">
                  Chưa có câu hỏi nào trong danh mục này.
                </CardContent>
              </Card>
            )}

            {!loading &&
              faqs.map((f) => (
                <Card
                  key={f.id}
                  className="hover:shadow-md transition cursor-pointer border"
                  onClick={() => navigate(`/faq/${f.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="text-sm text-blue-600 font-semibold mb-2">
                      {categoryName}
                    </div>

                    <div className="space-y-1">
                      {/* Tiêu đề: truncate inline */}
                      <h3 className="font-semibold text-base">
                        {(() => {
                          const t = (f.title || "").trim();
                          return t.length > 60
                            ? t.slice(0, 60).trimEnd() + "…"
                            : t;
                        })()}
                      </h3>

                      {/* Mô tả: strip HTML + truncate inline */}
                      <p className="text-sm text-gray-500 leading-snug">
                        {(() => {
                          const raw = f.content || "";
                          const txt = raw.replace(/<[^>]*>/g, "").trim();
                          return txt.length > 120
                            ? txt.slice(0, 120).trimEnd() + "…"
                            : txt;
                        })()}
                      </p>
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      {new Date(f.createdAt).toLocaleDateString("vi-VN")} •{" "}
                      {f.views} lượt xem
                    </div>

                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!no-underline"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Pagination đơn giản: 1..totalPages */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onChangePage(page - 1)}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink asChild isActive={page === p}>
                          <button onClick={() => onChangePage(p)}>{p}</button>
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onChangePage(page + 1)}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
