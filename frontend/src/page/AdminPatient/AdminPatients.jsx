import { useEffect, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "sonner";

import PatientFormDialog from "@/components/patientsManagement/PatientFormDialog";
import DeleteConfirmDialog from "@/components/patientsManagement/DeleteConfirmDialog";
import {
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  updatePatientStatus,
} from "@/api/patientApi";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import useDebounce from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);
  const [pageSize] = useState(5);

  const navigate = useNavigate();

  // ===== FETCH PATIENTS =====
  const loadPatients = async () => {
    try {
      const data = await fetchPatients(currentPage, pageSize, search);
      setPatients(data.patients || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Không thể tải danh sách bệnh nhân");
    }
  };

  useEffect(() => {
    loadPatients();
  }, [currentPage, search]);

  // ===== CREATE =====
  const handleCreate = async (data) => {
    const t = toast.loading("Đang tạo bệnh nhân...");
    try {
      await createPatient(data);
      toast.success("Thêm bệnh nhân thành công!", { id: t });
      setDialogOpen(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể thêm bệnh nhân", {
        id: t,
      });
    }
  };

  // ===== UPDATE =====
  const handleUpdate = async (id, data) => {
    const t = toast.loading("Đang cập nhật thông tin...");
    try {
      await updatePatient(id, data);
      toast.success("Cập nhật thành công!", { id: t });
      setEditDialogOpen(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.error || "Cập nhật thất bại", {
        id: t,
      });
    }
  };

  // ===== DELETE =====
  const handleDelete = (p) => {
    setSelectedPatient(p);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const t = toast.loading("Đang xóa...");
    try {
      await deletePatient(selectedPatient.id);
      toast.success("Xóa bệnh nhân thành công!", { id: t });
      loadPatients();
    } catch {
      toast.error("Xóa thất bại", { id: t });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  // ===== TOGGLE ACTIVE STATUS =====
  const handleToggleActive = async (patient, checked) => {
    const t = toast.loading("Đang cập nhật trạng thái...");
    try {
      await updatePatientStatus(patient.id, checked);
      toast.success(
        `Bệnh nhân ${patient.name} hiện đang ${
          checked ? "Hoạt động" : "Tạm khóa"
        }`,
        { id: t }
      );
      loadPatients();
    } catch {
      toast.error("Không thể cập nhật trạng thái", { id: t });
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Quản lý bệnh nhân</h4>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
          >
            Thêm bệnh nhân
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
          <TableCaption>Danh sách bệnh nhân</TableCaption>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead>STT</TableHead>
              <TableHead>Ảnh đại diện</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((p, index) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-gray-50 border-b border-gray-100 transition"
                >
                  <TableCell>
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-2xl">
                      <AvatarImage
                        src={`http://localhost:1118${p.avatar || ""}`}
                        alt={p.name}
                      />
                      <AvatarFallback>
                        {p.name?.charAt(0).toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.email || "-"}</TableCell>
                  <TableCell>{p.phoneNumber || "-"}</TableCell>
                  <TableCell className="capitalize">
                    {p.gender === "male"
                      ? "Nam"
                      : p.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={p.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(p, checked)
                        }
                        className="bg-gray-200 data-[state=checked]:bg-green-500 !rounded-full"
                      />
                      <span className="text-sm">
                        {p.isActive ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedPatient(p);
                        setEditDialogOpen(true);
                      }}
                      variant="outline"
                      className="!rounded-md"
                    >
                      Sửa
                    </Button>
                    <Button
                      onClick={() => navigate(`/admin/patient/${p.id}`)}
                      className="bg-green-500 hover:!bg-green-600 text-white !rounded-md"
                    >
                      Chi tiết
                    </Button>
                    <Button
                      onClick={() => handleDelete(p)}
                      className="bg-red-400 text-white !rounded-md hover:bg-red-500"
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Không có bệnh nhân nào
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
        <PatientFormDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          onSubmit={handleCreate}
        />
        <PatientFormDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          patientId={selectedPatient?.id}
          onSubmit={handleUpdate}
        />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          patient={selectedPatient}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
