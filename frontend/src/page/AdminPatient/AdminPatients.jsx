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
      toast.error("Failed to fetch patients");
    }
  };

  useEffect(() => {
    loadPatients();
  }, [currentPage, search]);

  // ===== CREATE =====
  const handleCreate = async (data) => {
    const t = toast.loading("Creating patient...");
    try {
      await createPatient(data);
      toast.success("Patient created successfully!", { id: t });
      setDialogOpen(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create patient", {
        id: t,
      });
    }
  };

  // ===== UPDATE =====
  const handleUpdate = async (id, data) => {
    const t = toast.loading("Updating patient...");
    try {
      await updatePatient(id, data);
      toast.success("Patient updated successfully!", { id: t });
      setEditDialogOpen(false);
      loadPatients();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update patient", {
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
    const t = toast.loading("Deleting...");
    try {
      await deletePatient(selectedPatient.id);
      toast.success("Deleted successfully!", { id: t });
      loadPatients();
    } catch {
      toast.error("Failed to delete patient", { id: t });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  // ===== TOGGLE ACTIVE STATUS =====
  const handleToggleActive = async (patient, checked) => {
    const t = toast.loading("Updating status...");
    try {
      await updatePatientStatus(patient.id, checked);
      toast.success(
        `Patient ${patient.name} is now ${checked ? "Active" : "Inactive"}`,
        { id: t }
      );
      loadPatients();
    } catch (err) {
      toast.error("Failed to update status", { id: t });
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white h-full p-5 rounded-lg shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold">Patient Management</h4>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
          >
            Create Patient
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
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
          <TableCaption>Patient List</TableCaption>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-gray-50 border-b border-gray-100 transition"
                >
                  <TableCell>{p.id}</TableCell>
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
                    {p.gender || "N/A"}
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
                        {p.isActive ? "Active" : "Inactive"}
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
                      Edit
                    </Button>
                    <Button
                      onClick={() => navigate(`/admin/patient/${p.id}`)}
                      className="bg-green-500 hover:!bg-green-600 text-white !rounded-md"
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => handleDelete(p)}
                      className="bg-red-400 text-white !rounded-md hover:bg-red-500"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No patients found
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
