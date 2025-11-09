// src/components/faq/FaqFormDialog.jsx
import React, { useEffect } from "react";
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
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const createSchema = z.object({
  title: z.string().min(3, "Vui lòng nhập tiêu đề tối thiểu 3 ký tự"),
  content: z.string().optional(),
  categoryId: z
    .number({ invalid_type_error: "Vui lòng chọn danh mục" })
    .int("Danh mục không hợp lệ"),
});

const editSchema = createSchema;

export default function FaqFormDialog({
  open,
  setOpen,
  onSubmit,
  categories = [],
  faq,
}) {
  const isEdit = Boolean(faq);

  const form = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && faq) {
      form.reset({
        title: faq.title || "",
        content: faq.content || "",
        categoryId:
          typeof faq.categoryId === "number"
            ? faq.categoryId
            : Number(faq.categoryId) || undefined,
      });
    } else {
      form.reset({
        title: "",
        content: "",
        categoryId: undefined,
      });
    }
  }, [open, isEdit, faq]);

  const handleSubmit = (data) => {
    if (isEdit) return onSubmit(faq.id, data);
    return onSubmit(data);
  };

  const currentCategory =
    categories.find((c) => c.id === form.watch("categoryId")) || null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa FAQ" : "Thêm FAQ mới"}</DialogTitle>
        </DialogHeader>

        <Form {...form} key={isEdit ? "faq-edit" : "faq-create"}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Tiêu đề */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tiêu đề <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tiêu đề câu hỏi..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Danh mục */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Danh mục <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        type="button"
                      >
                        {currentCategory
                          ? currentCategory.name
                          : "Chọn danh mục..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandGroup>
                          {categories.map((c) => {
                            const selected = field.value === c.id;
                            return (
                              <CommandItem
                                key={c.id}
                                onSelect={() => {
                                  // chuyển sang number để đúng schema
                                  field.onChange(Number(c.id));
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selected ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {c.name}
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

            {/* Nội dung */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập câu trả lời / hướng dẫn chi tiết…"
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-blue-600 text-white">
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
