import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/layout/AdminLayout";
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
import { API_ENDPOINTS } from "@/config";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  const totalPages = Math.ceil(users.length / pageSize);

  useEffect(() => {
    const fetchUsers = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setError("No auth token found. Please login.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_ENDPOINTS.GET_ALL_USERS}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // lấy user cho page hiện tại
  const currentUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2 font-black">{error}</div>}

      <Table>
        <TableCaption>Danh sách người dùng</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {currentUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
            </TableRow>
          ))}
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
                className="!no-underline !text-gray-800"
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  asChild
                  isActive={currentPage === i + 1}
                  className="!no-underline"
                >
                  <button
                    onClick={() => setCurrentPage(i + 1)}
                    className="text-gray-800 rounded-md px-3 py-1 hover:bg-gray-100"
                  >
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
                className="!no-underline !text-gray-800"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </AdminLayout>
  );
}

export default UserManagement;
