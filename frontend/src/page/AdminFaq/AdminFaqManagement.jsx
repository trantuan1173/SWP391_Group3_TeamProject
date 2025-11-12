import React, { useEffect, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";

import {
  fetchFaqCategorySummary,
  fetchFaqList,
  fetchFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} from "@/api/faqApi";

import FaqFormDialog from "@/components/faq/FaqFormDialog";
import DeleteConfirmDialog from "@/components/faq/DeleteConfirmDialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export default function AdminFaqManagement() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const [faqs, setFaqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedFaq, setSelectedFaq] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await fetchFaqCategorySummary();

      const normalized = (data || []).map((c) => ({
        id: c.id,
        name: c.category,
        description: c.description,
        count: c.count,
      }));
      setCategories(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh mục FAQ");
    }
  };

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize,
        search: search.trim(),
        categoryId: categoryId ? Number(categoryId) : undefined,
      };
      const data = await fetchFaqList(params);
      setFaqs(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách FAQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadFaqs();
  }, [currentPage, pageSize, search, categoryId]);

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenEdit = async (row) => {
    try {
      setLoading(true);

      const detail = await fetchFaqById(row.id);
      setSelectedFaq(detail);
      setEditOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải chi tiết FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload) => {
    const toastId = toast.loading("Đang tạo FAQ...");
    try {
      await createFaq(payload);
      toast.success("Tạo FAQ thành công!", { id: toastId });
      setCreateOpen(false);

      loadFaqs();
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Tạo FAQ thất bại", { id: toastId });
    }
  };

  const handleUpdate = async (id, payload) => {
    const toastId = toast.loading("Đang cập nhật FAQ...");
    try {
      await updateFaq(id, payload);
      toast.success("Cập nhật FAQ thành công!", { id: toastId });
      setEditOpen(false);
      setSelectedFaq(null);
      loadFaqs();
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật FAQ thất bại", { id: toastId });
    }
  };

  const handleOpenDelete = (row) => {
    setSelectedFaq(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFaq) return;
    const toastId = toast.loading("Đang xóa FAQ...");
    try {
      await deleteFaq(selectedFaq.id);
      toast.success("Xóa FAQ thành công", { id: toastId });
      setDeleteOpen(false);
      setSelectedFaq(null);

      if (faqs.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        loadFaqs();
      }
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Xóa FAQ thất bại", { id: toastId });
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Quản lý FAQ</h4>
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

            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <Button
              onClick={handleOpenCreate}
              className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
            >
              Thêm FAQ
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề/nội dung..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>

        {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-4 border rounded hover:shadow-sm transition cursor-default"
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.description}</div>
                <div className="mt-2 text-sm">
                  Số bài: <b>{c.count}</b>
                </div>
              </div>
            ))}
          </div>
        )}

        <Table>
          <TableCaption>Danh sách FAQ</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Lượt xem</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : faqs.length > 0 ? (
              faqs.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {(currentPage - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category?.name || "-"}</TableCell>
                  <TableCell>{item.views ?? 0}</TableCell>
                  <TableCell>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenEdit(item)}
                      variant="outline"
                      size="sm"
                      className="!rounded-md"
                    >
                      Sửa
                    </Button>
                    <Button
                      onClick={() => handleOpenDelete(item)}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white !rounded-md"
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Không có bài FAQ nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink asChild isActive={currentPage === i + 1}>
                    <button onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <FaqFormDialog
          open={createOpen}
          setOpen={setCreateOpen}
          categories={categories}
          onSubmit={handleCreate}
        />

        <FaqFormDialog
          open={editOpen}
          setOpen={setEditOpen}
          categories={categories}
          faq={selectedFaq}
          onSubmit={handleUpdate}
        />

        <DeleteConfirmDialog
          open={deleteOpen}
          setOpen={setDeleteOpen}
          faq={selectedFaq}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
