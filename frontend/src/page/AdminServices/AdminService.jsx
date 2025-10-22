import { useEffect, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
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
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import ServiceFormDialog from "@/components/services/ServiceFormDialog";
import DeleteConfirmDialog from "@/components/users/DeleteConfirmDialog"; // reuse dialog
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from "@/api/serviceApi";

export default function AdminService() {
  const [services, setServices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  // === FETCH ===
  const loadServices = async () => {
    try {
      const data = await fetchServices(currentPage, pageSize, search);
      setServices(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentPage, pageSize, search]);

  // === CREATE ===
  const handleCreate = async (formData) => {
    const toastId = toast.loading("Creating service...");
    try {
      await createService(formData);
      toast.success("Service created successfully", { id: toastId });
      setDialogOpen(false);
      loadServices();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create service", {
        id: toastId,
      });
    }
  };

  // === UPDATE ===
  const handleUpdate = async (id, formData) => {
    const toastId = toast.loading("Updating service...");
    try {
      await updateService(id, formData);
      toast.success("Service updated successfully", { id: toastId });
      setEditDialogOpen(false);
      loadServices();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update service", {
        id: toastId,
      });
    }
  };

  // === DELETE ===
  const handleDelete = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const toastId = toast.loading("Deleting service...");
    try {
      await deleteService(selectedService.id);
      toast.success("Service deleted successfully", { id: toastId });
      loadServices();
    } catch {
      toast.error("Failed to delete service", { id: toastId });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedService(null);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Service Management</h4>
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
              className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
              onClick={() => setDialogOpen(true)}
            >
              Create Service
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search service by name or description..."
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
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price (VNĐ)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>{(currentPage - 1) * pageSize + i + 1}</TableCell>
                <TableCell className="font-bold">{s.name}</TableCell>
                <TableCell>{s.description || "—"}</TableCell>
                <TableCell>{s.price.toLocaleString("vi-VN")}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedService(s);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleDelete(s)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No services found
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
        <ServiceFormDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          onSubmit={handleCreate}
        />
        <ServiceFormDialog
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
          service={selectedService}
          onSubmit={handleUpdate}
        />
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={selectedService}
          onConfirm={confirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
