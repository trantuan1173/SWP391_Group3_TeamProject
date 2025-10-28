import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ServiceDeleteDialog({
  open,
  setOpen,
  service,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center gap-2 text-center">
          <AlertTriangle className="text-red-500 w-10 h-10" />
          <DialogTitle className="text-lg font-semibold">
            Xác nhận xóa dịch vụ
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 text-center">
          Hành động này <b>không thể hoàn tác</b>. Dịch vụ{" "}
          <b className="text-red-600">{service?.name}</b> sẽ bị xóa vĩnh viễn
          khỏi hệ thống.
        </p>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
