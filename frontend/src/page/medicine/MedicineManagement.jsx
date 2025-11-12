import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";
import {
  fetchMedicines,
  fetchMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  fetchExpiringMedicines,
} from "@/api/medicineApi";
import MedicineDetailDialog from "@/components/medicines/MedicineDetailDialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import MedicineFormDialog from "@/components/medicines/MedicineFormDialog";
import DeleteConfirmDialog from "@/components/users/DeleteConfirmDialog"; // reuse
import useDebounce from "@/hooks/useDebounce";

export default function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [expiringSoon, setExpiringSoon] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const handleDetail = async (row) => {
    setDetailOpen(true);
    setDetailData(null);
    try {
      const data = await fetchMedicineById(row.id);
      setDetailData(data);
    } catch {
      setDetailOpen(false);
    }
  };

  const loadMedicines = async () => {
    try {
      const data = await fetchMedicines(currentPage, pageSize, search.trim());
      setMedicines(data.medicines || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Không thể tải danh sách thuốc");
    }
  };

  useEffect(() => {
    loadMedicines();
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    (async () => {
      try {
        const { expiring } = await fetchExpiringSoon();
        setExpiringSoon(expiring || []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const nearExpiryIds = useMemo(
    () => new Set(expiringSoon.map((e) => e.id)),
    [expiringSoon]
  );

  const handleCreate = async (payload) => {
    const toastId = toast.loading("Đang tạo thuốc...");
    try {
      await createMedicine(payload);
      toast.success("Tạo thuốc thành công!", { id: toastId });
      setDialogOpen(false);
      setCurrentPage(1);
      loadMedicines();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Lỗi khi tạo thuốc", {
        id: toastId,
      });
    }
  };

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (id, payload) => {
    const toastId = toast.loading("Đang cập nhật thuốc...");
    try {
      await updateMedicine(id, payload);
      toast.success("Cập nhật thành công!", { id: toastId });
      setEditDialogOpen(false);
      loadMedicines();
    } catch {
      toast.error("Cập nhật thất bại", { id: toastId });
    }
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRow) return;
    const toastId = toast.loading("Đang xóa thuốc...");
    try {
      await deleteMedicine(selectedRow.id);
      toast.success("Xóa thuốc thành công", { id: toastId });
      loadMedicines();
    } catch {
      toast.error("Xóa thuốc thất bại", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRow(null);
    }
  };

  return (
    <>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Quản lý thuốc</h4>
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

            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
            >
              Thêm thuốc
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-3">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên thuốc..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
          <div className="text-sm text-gray-600">
            {expiringSoon.length > 0 && (
              <span>⚠️ {expiringSoon.length} thuốc sắp hết hạn</span>
            )}
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableCaption>Danh sách thuốc</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên thuốc</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Dạng</TableHead>
              <TableHead>Đường dùng</TableHead>
              <TableHead>Hàm lượng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Tồn</TableHead>
              <TableHead>HSD</TableHead>
              <TableHead>RX</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.map((m, idx) => (
              <TableRow
                key={m.id}
                className={nearExpiryIds.has(m.id) ? "bg-yellow-50" : ""}
              >
                <TableCell>{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                <TableCell className="font-semibold">{m.name}</TableCell>
                <TableCell>{m.unit || "-"}</TableCell>
                <TableCell>{m.form || "-"}</TableCell>
                <TableCell>{m.route || "-"}</TableCell>
                <TableCell>{m.strength || "-"}</TableCell>
                <TableCell>{Number(m.price || 0).toLocaleString()}</TableCell>
                <TableCell>{m.quantity ?? 0}</TableCell>
                <TableCell>
                  {m.expiryDate
                    ? new Date(m.expiryDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      disabled
                      checked={!!m.isPrescription}
                      className="bg-gray-200 data-[state=checked]:bg-green-500 !rounded-full"
                    />
                    <span className="text-sm">
                      {m.isPrescription ? "Cần đơn" : "OTC"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="!rounded-md"
                    onClick={() => handleEdit(m)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white !rounded-md"
                    onClick={() => handleDetail(m)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white !rounded-md"
                    onClick={() => handleDelete(m)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {medicines.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-gray-500">
                  Không có thuốc nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
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

        {/* Dialogs */}
        <MedicineFormDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          onSubmit={handleCreate}
        />

        <MedicineDetailDialog
          open={detailOpen}
          setOpen={setDetailOpen}
          medicine={detailData}
        />
        <MedicineFormDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          medicineId={selectedId}
          onSubmit={handleUpdate}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={selectedRow ? { name: selectedRow.name } : null}
          onConfirm={confirmDelete}
        />
      </div>
    </>
  );
}
