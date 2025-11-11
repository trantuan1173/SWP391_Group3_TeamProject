/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { FileText, Shield, Wallet, Cog } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { fetchActivePolicyByCategory } from "@/api/policyApi";
import Header from "@/components/guestlayout/Header";

const CATEGORIES = [
  { key: "quy-dinh-chung", label: "Quy định chung", icon: FileText },
  { key: "bao-mat", label: "Bảo mật", icon: Shield },
  {
    key: "thanh-toan-hoan-tien",
    label: "Thanh toán & Hoàn tiền",
    icon: Wallet,
  },
  { key: "van-hanh", label: "Vận hành", icon: Cog },
];

// Map key -> tên category đúng như backend mong đợi
const CATEGORY_KEY_TO_NAME = {
  "quy-dinh-chung": "Quy định chung",
  "bao-mat": "Bảo mật",
  "thanh-toan-hoan-tien": "Thanh toán & Hoàn tiền",
  "van-hanh": "Vận hành",
};

function formatDateTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    // Hiển thị theo giờ địa phương của trình duyệt
    return d.toLocaleString();
  } catch {
    return isoString;
  }
}

function PolicySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-9/12" />
          <Skeleton className="h-4 w-8/12" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title = "Chưa có nội dung",
  desc = "Không tìm thấy chính sách active cho danh mục này.",
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ErrorState({ message }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Lỗi</AlertTitle>
      <AlertDescription>{message || "Không thể tải dữ liệu."}</AlertDescription>
    </Alert>
  );
}

function TermsAndPolicies() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].key);

  // Lưu policy theo từng category để cache (tránh gọi lại khi đổi tab qua lại)
  const [policies, setPolicies] = useState({}); // { [key]: policyObj | null }
  const [loading, setLoading] = useState({}); // { [key]: boolean }
  const [errors, setErrors] = useState({}); // { [key]: string | null }

  const activePolicy = policies[activeTab];
  const activeLoading = !!loading[activeTab];
  const activeError = errors[activeTab];

  async function loadActivePolicyByKey(categoryKey) {
    const categoryName = CATEGORY_KEY_TO_NAME[categoryKey];
    setLoading((prev) => ({ ...prev, [categoryKey]: true }));
    setErrors((prev) => ({ ...prev, [categoryKey]: null }));
    try {
      const res = await fetchActivePolicyByCategory(categoryName);
      console.log("Loaded active policy:", res);
      setPolicies((prev) => ({ ...prev, [categoryKey]: res }));
    } catch (err) {
      // Có thể 404 khi không có active policy
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Không thể tải chính sách";
      setErrors((prev) => ({ ...prev, [categoryKey]: msg }));
      setPolicies((prev) => ({ ...prev, [categoryKey]: null }));
    } finally {
      setLoading((prev) => ({ ...prev, [categoryKey]: false }));
    }
  }

  // Lần đầu mount: load tab đầu tiên
  useEffect(() => {
    loadActivePolicyByKey(CATEGORIES[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi đổi tab: nếu chưa có cache thì load
  useEffect(() => {
    if (policies[activeTab] === undefined && !loading[activeTab]) {
      loadActivePolicyByKey(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const tabsList = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const Icon = c.icon;
        return (
          <TabsTrigger
            key={c.key}
            value={c.key}
            className="gap-2 data-[state=active]:shadow-sm"
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{c.label}</span>
          </TabsTrigger>
        );
      }),
    []
  );

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Điều khoản & Chính sách
          </h1>
          <p className="text-sm text-muted-foreground">
            Nội dung dưới đây dành cho người dùng chưa đăng nhập (guest). Mỗi
            danh mục hiển thị chính sách đang hiệu lực (active) mới nhất.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap">{tabsList}</TabsList>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.key} value={c.key} className="mt-4">
              {errors[c.key] ? (
                <ErrorState message={errors[c.key]} />
              ) : activeLoading && c.key === activeTab ? (
                <PolicySkeleton />
              ) : policies[c.key] === null ? (
                <EmptyState />
              ) : policies[c.key] ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {policies[c.key].title}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>
                        Danh mục:{" "}
                        <span className="font-medium">
                          {CATEGORY_KEY_TO_NAME[c.key]}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cập nhật lần cuối:{" "}
                        {formatDateTime(policies[c.key].updatedAt)}{" "}
                        {policies[c.key].lastEditedBy ? (
                          <>
                            • Biên tập bởi:{" "}
                            <span className="font-medium">
                              {policies[c.key].lastEditedBy}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div
                        className="prose prose-sm sm:prose-base max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: policies[c.key].contentHtml,
                        }}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                // Trạng thái lần đầu click tab khác: có thể đang loading ngầm, show skeleton
                <PolicySkeleton />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}

export default TermsAndPolicies;
