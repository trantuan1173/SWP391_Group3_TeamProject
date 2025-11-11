import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PolicyDetailDialog({ open, setOpen, policy }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{policy?.title || "Chi tiết chính sách"}</DialogTitle>
          <DialogDescription className="space-x-2">
            <span>
              Danh mục: <b>{policy?.category || "—"}</b>
            </span>
            <span>
              • Trạng thái:{" "}
              <b>{policy?.status === "active" ? "Hoạt động" : "Tạm ẩn"}</b>
            </span>
            {policy?.lastEditedBy && (
              <span>
                • Sửa bởi: <b>{policy.lastEditedBy}</b>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div
          className="prose max-w-none border rounded-md p-4 overflow-auto"
          dangerouslySetInnerHTML={{
            __html: policy?.contentHtml || "<i>Không có nội dung</i>",
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
