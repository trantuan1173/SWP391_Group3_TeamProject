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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchRoles, fetchUserById } from "@/api/userApi";

// ===== Schema cho CREATE =====
const createSchema = z.object({
  name: z.string().min(3, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  identityNumber: z.string().min(9, "Vui lòng nhập số CCCD / CMND"),
  phoneNumber: z.string().min(9, "Vui lòng nhập số điện thoại"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  roles: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một vai trò"),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  avatar: z.any().optional(),
});

// ===== Schema cho EDIT =====
const editSchema = z.object({
  name: z.string().min(3, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .union([
      z.string().length(0),
      z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    ])
    .optional(),
  identityNumber: z.string().min(9, "Vui lòng nhập số CCCD / CMND"),
  phoneNumber: z.string().min(9, "Vui lòng nhập số điện thoại"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]),
  roles: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một vai trò"),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  avatar: z.any().optional(),
});

export default function UserFormDialog({ open, setOpen, onSubmit, userId }) {
  const isEdit = Boolean(userId);
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
      roles: [],
      address: "",
      avatar: null,
    },
  });

  useEffect(() => {
    if (open) {
      fetchRoles()
        .then((data) => {
          setRoles(Array.isArray(data.roles) ? data.roles : []);
        })
        .catch((err) => console.error("Lỗi khi tải vai trò:", err));
    }

    if (open && isEdit && userId) {
      setLoading(true);
      fetchUserById(userId)
        .then((data) => {
          form.reset({
            ...data,
            password: "",
            roles: data.roles?.map((r) => r.name) || ["doctor"],
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth).toISOString().split("T")[0]
              : "",
          });
        })
        .catch((err) => {
          console.error("Lỗi khi tải thông tin người dùng:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open, isEdit, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <Form {...form} key={isEdit ? "edit" : "create"}>
            <form
              onSubmit={form.handleSubmit((data) => {
                if (isEdit) {
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
                    <FormLabel>Ảnh đại diện</FormLabel>
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

              {/* Họ và tên */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập họ và tên..." />
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
                      <Input
                        type="email"
                        placeholder="Nhập email..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mật khẩu */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mật khẩu {isEdit && "(để trống nếu không muốn thay đổi)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CCCD */}
              <FormField
                control={form.control}
                name="identityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số CCCD / CMND</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập số CCCD / CMND..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Số điện thoại */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập số điện thoại..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Địa chỉ */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập địa chỉ đầy đủ..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngày sinh */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Giới tính & Vai trò */}
              <div className="grid grid-cols-2 gap-4">
                {/* Giới tính */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <FormControl>
                        <select
                          className="border rounded-md p-2 w-full"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vai trò (multi-select có tag xuống dòng) */}
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-start flex-wrap h-auto min-h-[40px] text-left"
                          >
                            {field.value.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {field.value.map((role) => (
                                  <span
                                    key={role}
                                    onClick={() =>
                                      field.onChange(
                                        field.value.filter((v) => v !== role)
                                      )
                                    }
                                    className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-sm cursor-pointer flex items-center gap-1"
                                  >
                                    {role}
                                    <X className="w-3 h-3" />
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Chọn vai trò...
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandGroup>
                              {roles.map((r) => {
                                const selected = field.value.includes(r.name);
                                return (
                                  <CommandItem
                                    key={r.id}
                                    onSelect={() => {
                                      const newValue = selected
                                        ? field.value.filter(
                                            (v) => v !== r.name
                                          )
                                        : [...field.value, r.name];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        selected ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {r.name.charAt(0).toUpperCase() +
                                      r.name.slice(1)}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Nút gửi */}
              <Button type="submit" className="w-full bg-blue-600 text-white">
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
