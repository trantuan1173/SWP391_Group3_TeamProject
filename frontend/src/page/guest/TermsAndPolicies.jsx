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

  const [policies, setPolicies] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const [activePolicyIndex, setActivePolicyIndex] = useState({});

  const activeLoading = !!loading[activeTab];

  async function loadActivePolicyByKey(categoryKey) {
    const categoryName = CATEGORY_KEY_TO_NAME[categoryKey];

    setLoading((prev) => ({ ...prev, [categoryKey]: true }));
    setErrors((prev) => ({ ...prev, [categoryKey]: null }));

    try {
      const list = await fetchActivePolicyByCategory(categoryName);

      setPolicies((prev) => ({
        ...prev,
        [categoryKey]: list,
      }));

      setActivePolicyIndex((prev) => ({
        ...prev,
        [categoryKey]: 0,
      }));
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Không thể tải chính sách";

      setErrors((prev) => ({ ...prev, [categoryKey]: msg }));
      setPolicies((prev) => ({ ...prev, [categoryKey]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [categoryKey]: false }));
    }
  }

  useEffect(() => {
    loadActivePolicyByKey(CATEGORIES[0].key);
  }, []);

  useEffect(() => {
    if (policies[activeTab] === undefined && !loading[activeTab]) {
      loadActivePolicyByKey(activeTab);
    }
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
            danh mục có thể có nhiều chính sách đang hiệu lực, bạn có thể chọn
            bên dưới để xem chi tiết.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap">{tabsList}</TabsList>

          {CATEGORIES.map((c) => {
            const categoryPolicies = policies[c.key] || [];
            const hasLoaded = policies[c.key] !== undefined;
            const categoryError = errors[c.key];
            const currentIndex =
              activePolicyIndex[c.key] !== undefined
                ? activePolicyIndex[c.key]
                : 0;
            const currentPolicy =
              categoryPolicies && categoryPolicies[currentIndex];

            return (
              <TabsContent key={c.key} value={c.key} className="mt-4">
                {categoryError ? (
                  <ErrorState message={categoryError} />
                ) : activeLoading && c.key === activeTab && !hasLoaded ? (
                  <PolicySkeleton />
                ) : !categoryPolicies.length ? (
                  <EmptyState />
                ) : !currentPolicy ? (
                  <PolicySkeleton />
                ) : (
                  <Card>
                    <CardHeader>
                      {/* Thanh chọn các policy trong cùng category (sub-tab) */}
                      {categoryPolicies.length > 1 && (
                        <div className="mb-3 space-y-1">
                          <div className="text-xs text-muted-foreground">
                            Có {categoryPolicies.length} chính sách trong danh
                            mục{" "}
                            <span className="font-medium">
                              {CATEGORY_KEY_TO_NAME[c.key]}
                            </span>
                            . Chọn bên dưới để xem:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categoryPolicies.map((p, idx) => (
                              <button
                                key={p.id ?? idx}
                                type="button"
                                onClick={() =>
                                  setActivePolicyIndex((prev) => ({
                                    ...prev,
                                    [c.key]: idx,
                                  }))
                                }
                                className={`px-3 py-1 rounded-full text-xs border transition ${
                                  idx === currentIndex
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {p.title || `Chính sách ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <CardTitle className="text-xl">
                        {currentPolicy.title}
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
                          {formatDateTime(currentPolicy.updatedAt)}{" "}
                          {currentPolicy.lastEditedBy ? (
                            <>
                              • Biên tập bởi:{" "}
                              <span className="font-medium">
                                {currentPolicy.lastEditedBy}
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
                            __html: currentPolicy.contentHtml,
                          }}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </>
  );
}

export default TermsAndPolicies;
