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
import UserTable from "@/components/users/UserTable";
import DeleteConfirmDialog from "@/components/users/DeleteConfirmDialog";
import { fetchUsers, createUser, deleteUser, updateUser } from "@/api/userApi";
import UserDetailDialog from "@/components/users/UserDetailDialog";
import UserEditDialog from "@/components/users/UserEditDialog";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();

        setUsers(data || []);
      } catch (err) {
        toast.error("Failed to fetch users");
      }
    };
    loadUsers();
  }, []);

  const handleCreateUser = async (data) => {
    try {
      const user = await createUser(data);
      setUsers((prev) => [...prev, user]);
      setDialogOpen(false);
      toast.success(`User ${user.name} created successfully!`);
    } catch {
      toast.error("Failed to create user");
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // mở detail
  const handleDetailUser = (user) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  // mở edit
  const handleEditUser = (user) => {
    console.log("Selected user for edit:", user);
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (id, data) => {
    const toastId = toast.loading("Updating user...");
    try {
      await updateUser(id, data);

      // Fetch lại toàn bộ users từ server
      const refreshedUsers = await fetchUsers();
      setUsers(refreshedUsers || []);

      toast.success("User updated successfully", { id: toastId });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update user", { id: toastId });
    }
  };
  const confirmDelete = async () => {
    if (!selectedUser) return;
    const toastId = toast.loading("Deleting user...");
    try {
      await deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      toast.success("User deleted successfully", { id: toastId });
    } catch {
      toast.error("Failed to delete user", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const totalPages = Math.ceil(users.length / pageSize);
  const currentUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold mb-4">User Management</h4>
          <UserFormDialog
            open={dialogOpen}
            setOpen={setDialogOpen}
            onSubmit={handleCreateUser}
          />
        </div>

        <UserTable
          users={currentUsers}
          onDelete={handleDeleteUser}
          onDetail={handleDetailUser}
          onEdit={handleEditUser}
        />

        <UserDetailDialog
          open={detailDialogOpen}
          setOpen={setDetailDialogOpen}
          user={selectedUser}
        />

        <UserEditDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          user={selectedUser}
          onSubmit={handleUpdateUser}
        />

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

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={selectedUser}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
