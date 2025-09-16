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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold mb-4">User Management</h1>
          <Button className="mb-4 bg-blue-500 !rounded-md text-white hover:bg-blue-600">
            Create User
          </Button>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500 mb-2 font-black">{error}</div>}

        <Table>
          <TableCaption>Danh sách người dùng</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Avatar className="h-16 w-16 rounded-2xl">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  {/* Future action buttons like Edit, Delete can go here */}
                  <Button
                    variant="outline"
                    className="border-gray-400 text-black !rounded-md hover:underline !mr-2 hover:bg-gray-200"
                  >
                    Edit
                  </Button>
                  <Button className="bg-blue-500 text-white !rounded-md hover:underline !mr-2 hover:bg-blue-700">
                    Details
                  </Button>
                  <Button className="bg-red-400 text-white !rounded-md hover:underline hover:bg-red-500">
                    Delete
                  </Button>
                </TableCell>
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
      </div>
    </AdminLayout>
  );
}

export default UserManagement;
