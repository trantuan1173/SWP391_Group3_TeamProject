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
import { use } from "react";
import { useNavigate } from "react-router-dom";

export default function UserTable({ users, onDelete, onEdit, onDetail }) {
  const navigate = useNavigate();
  return (
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
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
            <TableCell>
              <Button
                onClick={() => onEdit(user)}
                variant="outline"
                className="!rounded-md !mr-2"
              >
                Edit
              </Button>
              <Button
                // onClick={() => onDetail(user)}
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
      </TableBody>
    </Table>
  );
}
