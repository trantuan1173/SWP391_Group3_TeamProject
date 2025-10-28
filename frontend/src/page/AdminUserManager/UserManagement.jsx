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

import UserFormDialog from "@/components/users/UserFormDialog";
import DeleteConfirmDialog from "@/components/users/DeleteConfirmDialog";
import {
  fetchUsers,
  createUser,
  deleteUser,
  updateUser,
  updateUserStatus,
  updateDoctorSpeciality,
} from "@/api/userApi";
import UserDetailDialog from "@/components/users/UserDetailDialog";

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
import { useNavigate } from "react-router-dom";

import useDebounce from "@/hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPECIALTIES = [
  "Nội khoa",
  "Ngoại khoa",
  "Sản - Nhi",
  "Da liễu - Thẩm mỹ",
  "Tâm lý - Tâm thần",
  "Phục hồi chức năng",
  "Y học cổ truyền",
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  // ===== FETCH USERS =====
  const loadUsers = async () => {
    try {
      const data = await fetchUsers(currentPage, pageSize, search);
      setUsers(data.employees);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, search, pageSize]);

  // ===== CREATE USER =====
  const handleCreateUser = async (data) => {
    const toastId = toast.loading("Đang tạo người dùng...");
    try {
      await createUser(data);
      toast.success("Tạo người dùng thành công!", { id: toastId });
      setDialogOpen(false);
      loadUsers();
    } catch (error) {
      const errData = error.response?.data;
      if (Array.isArray(errData?.errors)) {
        errData.errors.forEach((err) => toast.error(err, { id: toastId }));
      } else {
        toast.error(errData?.error || "Lỗi khi tạo người dùng", {
          id: toastId,
        });
      }
    }
  };

  // ===== UPDATE =====
  const handleEditUser = (user) => {
    setSelectedUserId(user.id);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (id, data) => {
    const toastId = toast.loading("Đang cập nhật người dùng...");
    try {
      await updateUser(id, data);
      toast.success("Cập nhật thành công!", { id: toastId });
      setEditDialogOpen(false);
      loadUsers();
    } catch {
      toast.error("Cập nhật thất bại", { id: toastId });
    }
  };

  // ===== DELETE =====
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    const toastId = toast.loading("Đang xóa người dùng...");
    try {
      await deleteUser(selectedUser.id);
      toast.success("Xóa người dùng thành công", { id: toastId });
      loadUsers();
    } catch {
      toast.error("Xóa người dùng thất bại", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // ===== SPECIALTY =====
  const handleSelectSpecialty = (user) => {
    setSelectedUser(user);
    setSelectedSpecialty(user.specialty || "");
    setSpecialtyDialogOpen(true);
  };

  const confirmSpecialty = async () => {
    if (!selectedUser || !selectedSpecialty) {
      toast.error("Vui lòng chọn chuyên khoa");
      return;
    }
    const toastId = toast.loading("Đang cập nhật chuyên khoa...");
    try {
      await updateDoctorSpeciality(selectedUser.id, selectedSpecialty);
      toast.success("Cập nhật chuyên khoa thành công", { id: toastId });
      loadUsers();
      setSpecialtyDialogOpen(false);
    } catch {
      toast.error("Cập nhật chuyên khoa thất bại", { id: toastId });
    }
  };

  // ===== TOGGLE ACTIVE =====
  const handleToggleActive = async (user, checked) => {
    const toastId = toast.loading("Đang cập nhật trạng thái...");
    try {
      await updateUserStatus(user.id, checked);
      toast.success(
        `Người dùng ${user.name} đã được ${
          checked ? "kích hoạt" : "vô hiệu hóa"
        }`,
        { id: toastId }
      );
      loadUsers();
    } catch {
      toast.error("Không thể cập nhật trạng thái", { id: toastId });
    }
  };

  const isDoctor = (user) => {
    return (
      user.roles && user.roles.length > 0 && user.roles[0].name === "Doctor"
    );
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Quản lý nhân viên</h4>
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
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
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
          <TableCaption>Danh sách nhân viên</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Ảnh đại diện</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Chuyên khoa</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <Avatar className="h-10 w-10 rounded-2xl">
                    <AvatarImage
                      src={`http://localhost:1118${user.avatar}`}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-bold">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles && user.roles.length > 0 ? (
                    <div
                      className={`text-white text-[13px] font-bold capitalize rounded-3xl w-20 py-1 text-center ${
                        user.roles[0].name === "employee"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    >
                      {user.roles[0].name}
                    </div>
                  ) : (
                    <span className="text-gray-400">Không có vai trò</span>
                  )}
                </TableCell>
                <TableCell>
                  {isDoctor(user) ? (
                    <Button
                      onClick={() => handleSelectSpecialty(user)}
                      variant="outline"
                      size="sm"
                      className="!rounded-md text-xs"
                    >
                      {user.speciality || "Chọn chuyên khoa"}
                    </Button>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) =>
                        handleToggleActive(user, checked)
                      }
                      className="bg-gray-200 data-[state=checked]:bg-green-500 !rounded-full"
                    />
                    <span className="text-sm">
                      {user.isActive ? "Hoạt động" : "Tạm khóa"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button
                    onClick={() => handleEditUser(user)}
                    variant="outline"
                    className="!rounded-md"
                    size="sm"
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/user/${user.id}`)}
                    className="bg-green-500 hover:!bg-green-600 text-white !rounded-md"
                    size="sm"
                  >
                    Chi tiết
                  </Button>
                  <Button
                    className="bg-red-400 text-white !rounded-md hover:bg-red-500"
                    onClick={() => handleDeleteUser(user)}
                    size="sm"
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Không có người dùng nào
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
        <UserFormDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          onSubmit={handleCreateUser}
        />

        <UserFormDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          userId={selectedUserId}
          onSubmit={handleUpdateUser}
        />

        <UserDetailDialog
          open={detailDialogOpen}
          setOpen={setDetailDialogOpen}
          user={selectedUser}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={selectedUser}
          onConfirm={confirmDelete}
        />

        {/* Chọn chuyên khoa */}
        <Dialog
          open={specialtyDialogOpen}
          onOpenChange={setSpecialtyDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chọn chuyên khoa</DialogTitle>
              <DialogDescription>
                Chọn chuyên khoa cho {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chuyên khoa" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSpecialtyDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={confirmSpecialty}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Lưu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
