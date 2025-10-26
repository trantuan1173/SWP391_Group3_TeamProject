import { useEffect, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import RoleFormDialog from "@/components/roles/RoleFormDialog";
import DeleteConfirmDialog from "@/components/roles/DeleteConfirmDialog";
import { fetchRoles, createRole, updateRole, deleteRole } from "@/api/roleApi";
import useDebounce from "@/hooks/useDebounce";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles(currentPage, 5, search);
      setRoles(data.roles || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Không thể tải danh sách vai trò");
    }
  };

  useEffect(() => {
    loadRoles();
  }, [currentPage, search]);

  const handleCreateRole = async (data) => {
    const toastId = toast.loading("Đang tạo vai trò...");
    try {
      await createRole(data);
      toast.success("Tạo vai trò thành công!", { id: toastId });
      setDialogOpen(false);
      loadRoles();
    } catch {
      toast.error("Không thể tạo vai trò", { id: toastId });
    }
  };

  const handleUpdateRole = async (id, data) => {
    const toastId = toast.loading("Đang cập nhật vai trò...");
    try {
      await updateRole(id, data);
      toast.success("Cập nhật vai trò thành công!", { id: toastId });
      setEditDialogOpen(false);
      loadRoles();
    } catch {
      toast.error("Cập nhật vai trò thất bại", { id: toastId });
    }
  };

  const confirmDelete = async () => {
    const toastId = toast.loading("Đang xóa...");
    try {
      await deleteRole(selectedRole.id);
      toast.success("Xóa vai trò thành công!", { id: toastId });
      loadRoles();
    } catch {
      toast.error("Xóa vai trò thất bại", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Quản lý vai trò</h4>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
          >
            Thêm vai trò
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Tìm kiếm vai trò..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm mb-4"
        />

        {/* Table */}
        <Table>
          <TableCaption>Danh sách vai trò</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length > 0 ? (
              roles.map((r, index) => (
                <TableRow key={r.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-bold capitalize">
                    {r.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="!mr-2 !rounded-sm"
                      onClick={() => {
                        setSelectedRole(r);
                        setEditDialogOpen(true);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      className="bg-red-400 text-white hover:bg-red-500 !rounded-sm"
                      onClick={() => {
                        setSelectedRole(r);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  Không tìm thấy vai trò nào
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
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Dialogs */}
        <RoleFormDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          onSubmit={handleCreateRole}
        />
        <RoleFormDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          onSubmit={handleUpdateRole}
          roleId={selectedRole?.id}
        />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          role={selectedRole}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
