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
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    loadRoles();
  }, [currentPage, search]);

  const handleCreateRole = async (data) => {
    const toastId = toast.loading("Creating role...");
    try {
      await createRole(data);
      toast.success("Role created successfully!", { id: toastId });
      setDialogOpen(false);
      loadRoles();
    } catch {
      toast.error("Failed to create role", { id: toastId });
    }
  };

  const handleUpdateRole = async (id, data) => {
    const toastId = toast.loading("Updating role...");
    try {
      await updateRole(id, data);
      toast.success("Role updated successfully", { id: toastId });
      setEditDialogOpen(false);
      loadRoles();
    } catch {
      toast.error("Failed to update role", { id: toastId });
    }
  };

  const confirmDelete = async () => {
    const toastId = toast.loading("Deleting...");
    try {
      await deleteRole(selectedRole.id);
      toast.success("Deleted successfully!", { id: toastId });
      loadRoles();
    } catch {
      toast.error("Failed to delete role", { id: toastId });
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
          <h4 className="text-xl font-bold">Role Management</h4>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
          >
            Create Role
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search role..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm mb-4"
        />

        {/* Table */}
        <Table>
          <TableCaption>Role List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length > 0 ? (
              roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
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
                      Edit
                    </Button>
                    <Button
                      className="bg-red-400 text-white hover:bg-red-500 !rounded-sm"
                      onClick={() => {
                        setSelectedRole(r);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No roles found
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
