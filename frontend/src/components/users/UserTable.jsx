import { useState } from "react";
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
import { Input } from "@/components/ui/input"; // input từ shadcn/ui
import { useNavigate } from "react-router-dom";

export default function UserTable({ users, onDelete, onEdit, onDetail }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // lọc users theo search
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableCaption>User List</TableCaption>
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
          {filteredUsers.map((user) => (
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
                <div
                  className={`text-white font-bold capitalize rounded-3xl w-20 py-1 text-center ${
                    user.role === "patient" ? "bg-blue-500" : "bg-green-500"
                  }`}
                >
                  {user.role}
                </div>
              </TableCell>
              <TableCell>
                <div
                  className={`text-white font-bold capitalize rounded-3xl w-20 py-1 text-center ${
                    user.isActive ? "bg-green-400" : "bg-red-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => onEdit(user)}
                  variant="outline"
                  className="!rounded-md !mr-2"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => navigate(`/admin/user/${user.id}`)}
                  className="bg-green-500 hover:!bg-green-600 text-white !rounded-md !mr-2"
                >
                  Details
                </Button>
                <Button
                  className="bg-red-400 text-white !rounded-md hover:bg-red-500"
                  onClick={() => onDelete(user)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
