import { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(3, "Vui lòng nhập tên dịch vụ (ít nhất 3 ký tự)"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
});

export default function ServiceFormDialog({
  open,
  setOpen,
  onSubmit,
  service,
}) {
  const isEdit = Boolean(service);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
    },
  });

  useEffect(() => {
    if (service && open) {
      form.reset({
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
      });
    }
  }, [service, open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (isEdit) onSubmit(service.id, data);
              else onSubmit(data);
            })}
            className="space-y-4"
          >
            {/* Tên dịch vụ */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên dịch vụ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên dịch vụ..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập mô tả dịch vụ (tuỳ chọn)..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Giá dịch vụ */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (VNĐ)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="Nhập giá dịch vụ..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nút hành động */}
            <Button
              type="submit"
              className="w-full bg-green-500 text-white hover:bg-green-600"
            >
              {isEdit ? "Cập nhật dịch vụ" : "Tạo dịch vụ mới"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
