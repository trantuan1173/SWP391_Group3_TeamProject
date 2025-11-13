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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchMedicineById } from "@/api/medicineApi";
import { toast } from "sonner";

// ví dụ lấy id nhân viên từ localStorage/session
const getCurrentEmployeeId = () => {
  const raw = localStorage.getItem("authUser");
  try {
    return raw ? JSON.parse(raw).id : null;
  } catch {
    return null;
  }
};

// Schema CREATE / EDIT (giống nhau, nhưng name & unit bắt buộc)
const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập tên thuốc"),
  description: z.string().optional(),
  unit: z.string().min(1, "Vui lòng nhập đơn vị (viên, hộp...)"),
  form: z.string().optional(),
  route: z.string().optional(),
  strength: z.string().optional(),
  price: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().min(0, "Giá không hợp lệ")
  ),
  quantity: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Số lượng không hợp lệ")
  ),
  expiryDate: z.string().optional(),
  manufacturer: z.string().optional(),
  isPrescription: z.boolean().default(true),
});

export default function MedicineFormDialog({
  open,
  setOpen,
  onSubmit,
  medicineId,
}) {
  const isEdit = Boolean(medicineId);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      unit: "viên",
      form: "",
      route: "",
      strength: "",
      price: 0,
      quantity: 0,
      expiryDate: "",
      manufacturer: "",
      isPrescription: true,
    },
  });

  useEffect(() => {
    if (open && isEdit && medicineId) {
      setLoading(true);
      fetchMedicineById(medicineId)
        .then((data) => {
          form.reset({
            name: data.name || "",
            description: data.description || "",
            unit: data.unit || "",
            form: data.form || "",
            route: data.route || "",
            strength: data.strength || "",
            price: Number(data.price || 0),
            quantity: Number(data.quantity || 0),
            expiryDate: data.expiryDate
              ? new Date(data.expiryDate).toISOString().split("T")[0]
              : "",
            manufacturer: data.manufacturer || "",
            isPrescription: !!data.isPrescription,
          });
        })
        .catch(() => toast.error("Không thể tải thông tin thuốc"))
        .finally(() => setLoading(false));
    } else if (open && !isEdit) {
      form.reset({
        name: "",
        description: "",
        unit: "viên",
        form: "",
        route: "",
        strength: "",
        price: 0,
        quantity: 0,
        expiryDate: "",
        manufacturer: "",
        isPrescription: true,
      });
    }
  }, [open, isEdit, medicineId]);

  const handleSubmit = (data) => {
    if (!isEdit) {
      onSubmit(data);
    } else {
      onSubmit(medicineId, data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa thuốc" : "Thêm thuốc mới"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thuốc</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ví dụ: Paracetamol 500mg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả / Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Công dụng, lưu ý..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="unit"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="viên / hộp / chai..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="form"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dạng bào chế</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="viên nén / siro / bột pha..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="route"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đường dùng</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="uống / tiêm / nhỏ mắt..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="strength"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hàm lượng</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="500mg / 1g / 5mg/ml..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="price"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="quantity"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="expiryDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hạn dùng</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="manufacturer"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hãng sản xuất</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Traphaco / DHG..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="isPrescription"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel>Cần đơn bác sĩ?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 data-[state=checked]:bg-green-500 !rounded-full"
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
        )}
      </DialogContent>
    </Dialog>
  );
}
