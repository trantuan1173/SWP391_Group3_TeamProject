import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchRoles, fetchUserById } from "@/api/userApi";

// ===== Schema cho CREATE =====
const createSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 chars"), // bắt buộc
  identityNumber: z.string().min(9, "Identity number required"),
  phoneNumber: z.string().min(9, "Phone number required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  role: z.string().min(1, "Role is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  avatar: z.any().optional(),
});

// ===== Schema cho EDIT =====
const editSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z
    .union([
      z.string().length(0),
      z.string().min(6, "Password must be at least 6 chars"),
    ])
    .optional(),
  identityNumber: z.string().min(9, "Identity number required"),
  phoneNumber: z.string().min(9, "Phone number required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  role: z.string().min(1, "Role is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  avatar: z.any().optional(),
});

export default function UserFormDialog({ open, setOpen, onSubmit, userId }) {
  const isEdit = Boolean(userId); // check mode
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  const form = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      identityNumber: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "male",
      role: "doctor",
      address: "",
      avatar: null,
    },
  });

  useEffect(() => {
    if (open) {
      fetchRoles()
        .then(setRoles)
        .catch((err) => console.error("Failed to load roles", err));
    }

    if (open && isEdit && userId) {
      setLoading(true);
      fetchUserById(userId)
        .then((data) => {
          form.reset({
            ...data,
            password: "",
            role: data.Roles?.[0]?.name || "doctor",
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split("T")[0]
              : "",
          });
        })
        .catch((err) => {
          console.error("Failed to fetch user detail", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open, isEdit, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <Form {...form} key={isEdit ? "edit" : "create"}>
            <form
              onSubmit={form.handleSubmit((data) => {
                if (isEdit) {
                  // nếu password trống thì bỏ ra, không gửi lên server
                  if (!data.password) delete data.password;
                  onSubmit(userId, data);
                } else {
                  onSubmit(data);
                }
              })}
              className="space-y-4"
            >
              {/* Avatar */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {isEdit && "(leave blank to keep current)"}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Identity Number */}
              <FormField
                control={form.control}
                name="identityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identity Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter full address..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender & Role */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.name}>
                              {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full bg-blue-600 text-white">
                {isEdit ? "Update" : "Submit"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
