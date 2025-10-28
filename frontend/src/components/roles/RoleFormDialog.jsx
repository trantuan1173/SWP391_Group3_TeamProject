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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchRoleById } from "@/api/roleApi";

const schema = z.object({
  name: z.string().min(3, "Vui lòng nhập tên vai trò (tối thiểu 3 ký tự)"),
});

export default function RoleFormDialog({ open, setOpen, onSubmit, roleId }) {
  const isEdit = Boolean(roleId);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open && isEdit && roleId) {
      setLoading(true);
      fetchRoleById(roleId)
        .then((data) => {
          form.reset({ name: data.name || "" });
        })
        .finally(() => setLoading(false));
    }
  }, [open, isEdit, roleId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-4 text-gray-500 text-center">
            Đang tải dữ liệu...
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                if (isEdit) onSubmit(roleId, data);
                else onSubmit(data);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên vai trò</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên vai trò..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-500 text-white hover:bg-green-600"
              >
                {isEdit ? "Cập nhật vai trò" : "Tạo vai trò mới"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
