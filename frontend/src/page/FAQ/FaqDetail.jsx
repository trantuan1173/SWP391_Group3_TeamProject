import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFaqById, fetchFaqList } from "@/api/faqApi";
import Header from "@/components/guestlayout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CalendarDays, User2, BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/guestlayout/Footer";

// helpers
function truncate(str = "", n = 100) {
  if (!str) return "";
  const s = String(str).trim();
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}
function stripHtml(html = "") {
  return String(html).replace(/<[^>]+>/g, "");
}

export default function FaqDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const faqId = Number(id);

  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  const categoryName = useMemo(() => faq?.category?.name || "FAQ", [faq]);

  async function loadDetail() {
    try {
      setLoading(true);
      const data = await fetchFaqById(faqId);
      setFaq(data);
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải bài viết FAQ");
    } finally {
      setLoading(false);
    }
  }

  async function loadRelated(categoryId) {
    if (!categoryId) return;
    try {
      const data = await fetchFaqList({
        page: 1,
        pageSize: 6,
        search: "",
        categoryId,
      });
      const items = Array.isArray(data.items) ? data.items : [];
      setRelated(items.filter((x) => x.id !== faqId).slice(0, 6));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!faqId) return;
    loadDetail();
  }, [faqId]);

  useEffect(() => {
    if (faq?.categoryId) {
      loadRelated(faq.categoryId);
    }
  }, [faq?.categoryId]); // khi detail về, kéo related theo

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 flex items-center gap-1 mb-4">
          <button className="hover:underline" onClick={() => navigate(-1)}>
            Help Center
          </button>
          <ChevronRight className="w-4 h-4 opacity-60" />
          <span
            className="hover:underline cursor-pointer"
            onClick={() =>
              navigate(
                `/faq/category/${faq?.categoryId}?name=${encodeURIComponent(
                  categoryName
                )}`
              )
            }
          >
            {categoryName}
          </span>
          <ChevronRight className="w-4 h-4 opacity-60" />
          <span className="text-gray-700">Chi tiết</span>
        </div>

        {/* Header block */}
        <div className="rounded-xl bg-white p-5 shadow-sm border">
          <div className="mb-3">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
              {categoryName}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold leading-tight">
            {loading ? "Đang tải…" : faq?.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{faq?.views ?? 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {faq?.createdAt
                  ? new Date(faq.createdAt).toLocaleDateString("vi-VN")
                  : "--/--/----"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User2 className="w-4 h-4" />
              <span>Support Team</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">
          <Card>
            <CardContent className="p-5">
              {loading ? (
                <div className="text-gray-500">Đang tải nội dung…</div>
              ) : faq?.content ? (
                <div
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: faq.content }}
                />
              ) : (
                <div className="text-gray-500">
                  Bài viết này chưa có nội dung.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Articles */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-lg font-semibold mb-3">
            <BookOpen className="w-5 h-5 text-gray-700" />
            Related Articles
          </div>

          {related.length === 0 ? (
            <div className="text-sm text-gray-500">
              Chưa có bài viết liên quan.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Card
                  key={r.id}
                  className="hover:shadow-md transition cursor-pointer border"
                  onClick={() => navigate(`/faq/${r.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold text-orange-700 mb-2">
                      {categoryName}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{truncate(r.title, 12)}</h3>
                      <p className="text-sm text-gray-500">
                        {truncate(stripHtml(r.content || ""), 110)}
                      </p>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")} •{" "}
                      {r.views} views
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!no-underline"
                      >
                        Read more →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ask a Question CTA */}
        <div className="mt-10 flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/support/ticket/new")}
          >
            Ask a Question
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}
