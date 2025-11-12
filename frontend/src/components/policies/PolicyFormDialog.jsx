import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const CATEGORIES = [
  "Quy định chung",
  "Bảo mật",
  "Thanh toán & Hoàn tiền",
  "Vận hành",
  "Khác",
];

export default function PolicyFormDialog({
  open,
  setOpen,
  initialData,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [status, setStatus] = useState(initialData?.status || "active");
  const [contentHtml, setContentHtml] = useState(
    initialData?.contentHtml || ""
  );
  const [contentDelta, setContentDelta] = useState(
    initialData?.contentDelta || null
  );
  const [lastEditedBy, setLastEditedBy] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || "");
      setCategory(initialData?.category || "");
      setStatus(initialData?.status || "active");
      setContentHtml(initialData?.contentHtml || "");
      setContentDelta(initialData?.contentDelta || null);
      setLastEditedBy("");
    }
  }, [open, initialData]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "clean"],
      ],
      history: { delay: 500, maxStack: 100, userOnly: true },
    }),
    []
  );

  const quillFormats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "color",
      "background",
      "align",
      "link",
    ],
    []
  );

  const quillKey = useMemo(
    () =>
      (initialData
        ? `${initialData.title || ""}-${initialData.category || ""}`
        : "create") + `-${open ? "open" : "closed"}`,
    [initialData, open]
  );

  const handleSave = () => {
    if (!title.trim() || !category.trim() || !contentHtml.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    onSubmit({
      title: title.trim(),
      category: category.trim(),
      status,
      contentHtml,
      contentDelta: contentDelta || {},
      lastEditedBy,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Chỉnh sửa chính sách" : "Thêm chính sách"}
          </DialogTitle>
          <DialogDescription>
            Nhập tiêu đề, chọn danh mục, trạng thái và soạn nội dung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Tiêu đề *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục *" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm ẩn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            {/* Chỉ render khi open để tránh lỗi/hydration trong portal */}
            {open && (
              <ReactQuill
                key={quillKey}
                theme="snow"
                value={contentHtml}
                modules={quillModules}
                formats={quillFormats}
                onChange={(_html, _delta, _source, editor) => {
                  const html = editor.getHTML();
                  const delta = editor.getContents();
                  setContentHtml(html);
                  setContentDelta(delta);
                }}
                className="h-72 [&_.ql-container]:h-64"
              />
            )}
          </div>

          <Input
            placeholder="Người chỉnh sửa gần nhất (tuỳ chọn)"
            value={lastEditedBy}
            onChange={(e) => setLastEditedBy(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600"
          >
            {initialData ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
