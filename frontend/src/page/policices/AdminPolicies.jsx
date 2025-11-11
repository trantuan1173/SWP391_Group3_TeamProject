import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";

import {
  fetchPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "@/api/policyApi";

import PolicyFormDialog from "@/components/policies/PolicyFormDialog";
import PolicyDetailDialog from "@/components/policies/PolicyDetailDialog";
import PolicyDeleteConfirmDialog from "@/components/policies/PolicyDeleteConfirmDialog";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Quy định chung",
  "Bảo mật",
  "Thanh toán & Hoàn tiền",
  "Vận hành",
  "Khác",
];

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);

  const navigate = useNavigate();

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await fetchPolicies(
        currentPage,
        pageSize,
        search.trim(),
        categoryFilter,
        statusFilter
      );
      setPolicies(Array.isArray(data?.policies) ? data.policies : []);
      setTotalPages(Number(data?.totalPages) || 1);
    } catch (e) {
      toast.error("Không thể tải danh sách chính sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, search, categoryFilter, statusFilter]);

  const visiblePolicies = useMemo(() => policies, [policies]);

  const openCreate = () => {
    setEditingPolicy(null);
    setFormOpen(true);
  };

  const openEdit = (p) => {
    setEditingPolicy(p);
    setFormOpen(true);
  };

  const handleSubmit = async (payload, id) => {
    const toastId = toast.loading(
      id ? "Đang cập nhật chính sách..." : "Đang tạo chính sách..."
    );
    try {
      if (id) {
        await updatePolicy(id, payload);
        toast.success("Cập nhật chính sách thành công!", { id: toastId });
      } else {
        await createPolicy(payload);
        toast.success("Tạo chính sách thành công!", { id: toastId });
      }
      setFormOpen(false);
      loadPolicies();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Lỗi khi lưu chính sách", {
        id: toastId,
      });
    }
  };

  const askDelete = (p) => {
    setSelectedPolicy(p);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPolicy) return;
    const toastId = toast.loading("Đang xóa chính sách...");
    try {
      await deletePolicy(selectedPolicy.id);
      toast.success("Xóa thành công", { id: toastId });
      loadPolicies();
    } catch {
      toast.error("Xóa thất bại", { id: toastId });
    } finally {
      setDeleteOpen(false);
      setSelectedPolicy(null);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Quản lý chính sách</h4>
          <div className="flex gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="5">5 / trang</option>
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
            </select>

            {/* Category filter: dùng "all" thay cho "" */}
            <Select
              value={categoryFilter || "all"}
              onValueChange={(v) => {
                setCategoryFilter(v === "all" ? "" : v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter: dùng "all" thay cho "" */}
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) => {
                setStatusFilter(v === "all" ? "" : v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm ẩn</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={openCreate}
              className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm chính sách
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <Table>
          <TableCaption>Danh sách chính sách</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người sửa</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="w-[260px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              visiblePolicies.map((p, index) => (
                <TableRow key={String(p.id)}>
                  <TableCell>
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold">{p.title}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 text-xs">
                      {p.category || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-2xl text-white text-xs ${
                        p.status === "active" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    >
                      {p.status === "active" ? "Hoạt động" : "Tạm ẩn"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.lastEditedBy || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="!rounded-md"
                      size="sm"
                      onClick={() => navigate(`/admin/policies/${p.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Xem
                    </Button>
                    <Button
                      onClick={() => openEdit(p)}
                      variant="outline"
                      className="!rounded-md"
                      size="sm"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      className="bg-red-400 text-white !rounded-md hover:bg-red-500"
                      onClick={() => askDelete(p)}
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

            {!loading && visiblePolicies.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Không có chính sách nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination (không dùng asChild) */}
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Dialogs */}
        <PolicyFormDialog
          open={formOpen}
          setOpen={setFormOpen}
          initialData={
            editingPolicy
              ? {
                  title: editingPolicy.title,
                  category: editingPolicy.category,
                  status: editingPolicy.status,
                  contentHtml: editingPolicy.contentHtml,
                  contentDelta: editingPolicy.contentDelta,
                }
              : undefined
          }
          onSubmit={(data) =>
            handleSubmit(
              { ...data, lastEditedBy: data.lastEditedBy?.trim() || undefined },
              editingPolicy ? editingPolicy.id : undefined
            )
          }
        />

        <PolicyDetailDialog
          open={detailOpen}
          setOpen={setDetailOpen}
          policy={selectedPolicy}
        />

        <PolicyDeleteConfirmDialog
          open={deleteOpen}
          setOpen={setDeleteOpen}
          title="Xác nhận xóa"
          description={`Hành động này không thể hoàn tác. Chính sách "${
            selectedPolicy?.title || ""
          }" sẽ bị xóa vĩnh viễn.`}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
