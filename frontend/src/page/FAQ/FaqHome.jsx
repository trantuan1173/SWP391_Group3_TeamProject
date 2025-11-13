import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchFaqCategorySummary } from "@/api/faqApi";
import {
  CalendarClock,
  CreditCard,
  UserCog,
  Stethoscope,
  FileText,
  Pill,
} from "lucide-react";
import Header from "@/components/guestlayout/Header";

const ICONS = {
  "Đặt lịch & Lịch khám": CalendarClock,
  "Thanh toán & Bảo hiểm": CreditCard,
  "Tài khoản bệnh nhân": UserCog,
  "Dịch vụ & Bác sĩ": Stethoscope,
  "Kết quả & Hồ sơ bệnh án": FileText,
  "Nhà thuốc & Đơn thuốc": Pill,
};

export default function FaqHome() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchFaqCategorySummary();
      console.log("Fetched FAQ categories:", data);
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh mục FAQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trung tâm trợ giúp</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn danh mục để xem các câu hỏi thường gặp
            </p>
          </div>
          <Button className={"!no-underline"} asChild variant="outline">
            <Link to="/patient/ticket">Không thấy câu trả lời? Gửi ticket</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-1">
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </div>
    </>
  );
}

function CategoryGrid({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm">
        Chưa có danh mục FAQ nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((c) => {
        const Icon = ICONS[c.category] || FileText;
        return (
          <Card key={c.id} className="hover:shadow-sm transition">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{c.category}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {c.description || "Không có mô tả"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex justify-between items-center">
              <Badge variant="secondary" className={"bg-green-300"}>
                {c.count} bài
              </Badge>
              <Button
                asChild
                size="sm"
                className={"!no-underline border-1 "}
                variant="ghost"
              >
                <Link
                  to={`/faq/category/${c.id}?name=${encodeURIComponent(
                    c.category
                  )}`}
                  state={{ categoryName: c.category }}
                >
                  Xem câu hỏi
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
