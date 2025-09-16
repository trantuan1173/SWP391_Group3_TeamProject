import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

/**
 * Edit schema: password optional (leave blank to keep current password).
 * avatar optional (if provided, will be uploaded).
 */
const schema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  // Fix: Cho phép empty string hoặc password có ít nhất 6 ký tự
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 6, {
      message: "Password must be at least 6 chars",
    })
    .optional(),
  identityNumber: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  role: z.enum(["doctor", "patient", "admin"]).optional(),
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .optional(),
  avatar: z.any().optional(),
});

export default function UserEditDialog({ open, setOpen, user, onSubmit }) {
  const [preview, setPreview] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      identityNumber: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "male",
      role: "doctor",
      address: "", // Thêm default value cho address
      avatar: null,
    },
  });

  // When `user` changes (open), reset form values and preview
  useEffect(() => {
    if (user) {
      console.log("Editing user:", user);
      // normalize date to yyyy-mm-dd if possible
      let dob = "";
      if (user.dateOfBirth) {
        // handle ISO like "1990-01-01T00:00:00.000Z" or "1990-01-01"
        dob = String(user.dateOfBirth).split("T")[0];
      }

      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        password: "", // leave empty by default
        identityNumber: user.identityNumber ?? "",
        phoneNumber: user.phoneNumber ?? "",
        dateOfBirth: dob,
        gender: user.gender ?? "male",
        role: user.role ?? "doctor",
        address: user.address ?? "", // Thêm address vào reset form
        avatar: null,
      });

      // preview existing avatar if present (handle absolute or relative path)
      if (user.avatar) {
        const previewUrl = user.avatar.startsWith("http")
          ? user.avatar
          : `http://localhost:1118${user.avatar}`;
        setPreview(previewUrl);
      } else {
        setPreview(null);
      }
    } else {
      form.reset();
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Called when user submits edit form
  const handleSubmit = async (values) => {
    if (!user) return;
    // Build FormData because avatar may be a file
    const fd = new FormData();

    // Append only fields we want to update
    fd.append("name", values.name || "");
    fd.append("email", values.email || "");
    if (values.password && values.password.trim() !== "") {
      fd.append("password", values.password);
    }
    if (values.identityNumber !== undefined)
      fd.append("identityNumber", values.identityNumber || "");
    if (values.phoneNumber !== undefined)
      fd.append("phoneNumber", values.phoneNumber || "");
    if (values.dateOfBirth !== undefined)
      fd.append("dateOfBirth", values.dateOfBirth || "");
    if (values.gender !== undefined) fd.append("gender", values.gender);
    if (values.role !== undefined) fd.append("role", values.role);
    // Thêm address vào FormData
    if (values.address !== undefined)
      fd.append("address", values.address || "");

    // avatar might be a File (from input) or null
    if (values.avatar instanceof File) {
      fd.append("avatar", values.avatar);
    }

    // call parent's onSubmit(id, formData)
    // parent should handle axios PUT with multipart/form-data
    try {
      await onSubmit(user.id, fd);
      // parent is expected to close dialog on success, but do it here too for safety
      setOpen(false);
    } catch (err) {
      // parent handles toasts; just log here
      console.error("Update failed", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Avatar + preview */}
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
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        field.onChange(file);
                        if (file) {
                          setPreview(URL.createObjectURL(file));
                        } else if (user?.avatar) {
                          setPreview(
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `http://localhost:1118${user.avatar}`
                          );
                        } else {
                          setPreview(null);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {preview && (
                    <div className="mt-2">
                      <img
                        src={preview}
                        alt="avatar preview"
                        className="h-24 w-24 rounded-full object-cover border"
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (leave blank to keep current)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* ===== THÊM TRƯỜNG ADDRESS ===== */}
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
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white">
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
