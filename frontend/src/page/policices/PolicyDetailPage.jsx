import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchPolicyById } from "@/api/policyApi";

function Pill({ children, color = "blue" }) {
  const map = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`px-3 py-1 rounded-2xl text-xs border ${map[color]}`}>
      {children}
    </span>
  );
}

export default function PolicyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy policy theo id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPolicyById(id);
        if (!mounted) return;
        // Chuẩn hoá key đề phòng backend trả khác nhau
        const normalized = {
          id: data.id,
          title: data.title,
          category: data.category,
          status: data.status,
          contentHtml: data.contentHtml,
          contentDelta: data.contentDelta,
          lastEditedBy: data.lastEditedBy || data.updatedBy || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        setPolicy(normalized);
      } catch (e) {
        toast.error("Không thể tải chi tiết chính sách");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const statusColor = useMemo(
    () => (policy?.status === "active" ? "green" : "orange"),
    [policy?.status]
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mb-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Quay lại
            </Button>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
            <div className="h-96 bg-gray-100 rounded" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!policy) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mb-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Quay lại
            </Button>
          </div>
          <div className="text-gray-600">Không tìm thấy chính sách.</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Quay lại danh sách
          </Button>
          {/* Read-only: không có nút Sửa/Lưu */}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">{policy.title}</h1>

        {/* Meta grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-28">Danh mục</span>
            <Pill color="blue">{policy.category || "—"}</Pill>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-28">Trạng thái</span>
            <Pill color={statusColor}>{policy.status || "—"}</Pill>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-28">Cập nhật</span>
            <span className="text-sm">
              {policy.updatedAt
                ? new Date(policy.updatedAt).toLocaleString()
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-28">Người sửa</span>
            <span className="text-sm">{policy.lastEditedBy || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-28">Tạo lúc</span>
            <span className="text-sm">
              {policy.createdAt
                ? new Date(policy.createdAt).toLocaleString()
                : "—"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="mb-3 font-semibold">Nội dung</div>
          <div
            className="prose max-w-none"
            // Read-only: render HTML đã lưu
            dangerouslySetInnerHTML={{ __html: policy.contentHtml || "" }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
