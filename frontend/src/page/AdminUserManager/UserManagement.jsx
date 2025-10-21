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
import { Search } from "lucide-react";
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
      console.log(data.employees);
      setUsers(data.employees);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, search, pageSize]);

  // ===== CREATE USER =====
  const handleCreateUser = async (data) => {
    const toastId = toast.loading("Creating user...");
    try {
      await createUser(data);
      toast.success("User created successfully!", { id: toastId });
      setDialogOpen(false);
      loadUsers();
    } catch (error) {
      const errData = error.response?.data;

      if (Array.isArray(errData?.errors)) {
        errData.errors.forEach((err) => toast.error(err, { id: toastId }));
      } else if (errData?.error) {
        toast.error(errData.error, { id: toastId });
      } else {
        toast.error("Failed to create user", { id: toastId });
      }
    }
  };

  // ===== EDIT / UPDATE =====
  const handleEditUser = (user) => {
    setSelectedUserId(user.id);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (id, data) => {
    const toastId = toast.loading("Updating user...");
    try {
      await updateUser(id, data);
      toast.success("User updated successfully", { id: toastId });
      setEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      const errData = error.response?.data;

      if (Array.isArray(errData?.errors)) {
        errData.errors.forEach((err) => toast.error(err, { id: toastId }));
      } else if (errData?.error) {
        toast.error(errData.error, { id: toastId });
      } else {
        toast.error("Failed to update user", { id: toastId });
      }
    }
  };

  // ===== DELETE =====
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    const toastId = toast.loading("Deleting user...");
    try {
      await deleteUser(selectedUser.id);
      toast.success("User deleted successfully", { id: toastId });
      loadUsers();
    } catch {
      toast.error("Failed to delete user", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // ===== DETAIL =====
  const handleDetailUser = (user) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  // ===== SPECIALTY =====
  const handleSelectSpecialty = (user) => {
    setSelectedUser(user);
    setSelectedSpecialty(user.specialty || "");
    setSpecialtyDialogOpen(true);
  };

  const confirmSpecialty = async () => {
    if (!selectedUser || !selectedSpecialty) {
      toast.error("Please select a specialty");
      return;
    }
    const toastId = toast.loading("Updating specialty...");
    try {
      await updateDoctorSpeciality(selectedUser.id, selectedSpecialty);
      toast.success("Specialty updated successfully", { id: toastId });
      loadUsers();
      setSpecialtyDialogOpen(false);
    } catch (error) {
      const errData = error.response?.data;
      toast.error(errData?.error || "Failed to update specialty", {
        id: toastId,
      });
    }
  };

  // ===== TOGGLE ACTIVE =====
  const handleToggleActive = async (user, checked) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateUserStatus(user.id, checked);
      toast.success(
        `User ${user.name} is now ${checked ? "Active" : "Inactive"}`,
        { id: toastId }
      );
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status", { id: toastId });
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
          <h4 className="text-xl font-bold">Employee Management</h4>
          <div className="flex gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>

            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
            >
              Create User
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search by name or email..."
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
          <TableCaption>Employee List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
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
                <TableCell>{user.name}</TableCell>
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
                    <span className="text-gray-400">No role</span>
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
                      {user.speciality || "Assign Specialty"}
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
                      {user.isActive ? "Active" : "Inactive"}
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
                    Edit
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/user/${user.id}`)}
                    className="bg-green-500 hover:!bg-green-600 text-white !rounded-md"
                    size="sm"
                  >
                    Details
                  </Button>
                  <Button
                    className="bg-red-400 text-white !rounded-md hover:bg-red-500"
                    onClick={() => handleDeleteUser(user)}
                    size="sm"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No users found
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
        {/* Create */}
        <UserFormDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          onSubmit={handleCreateUser}
        />

        {/* Edit */}
        <UserFormDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          userId={selectedUserId}
          onSubmit={handleUpdateUser}
        />

        {/* Detail */}
        <UserDetailDialog
          open={detailDialogOpen}
          setOpen={setDetailDialogOpen}
          user={selectedUser}
        />

        {/* Delete */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={selectedUser}
          onConfirm={confirmDelete}
        />

        {/* Specialty Selection */}
        <Dialog
          open={specialtyDialogOpen}
          onOpenChange={setSpecialtyDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Specialty</DialogTitle>
              <DialogDescription>
                Choose a specialty for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a specialty" />
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
                  Cancel
                </Button>
                <Button
                  onClick={confirmSpecialty}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
