import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MedicineDetailDialog({ open, setOpen, medicine }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Chi tiết thuốc</DialogTitle>
        </DialogHeader>

        {!medicine ? (
          <div className="text-gray-500">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <div className="text-xs text-gray-500">Tên thuốc</div>
              <div className="font-semibold text-base">{medicine.name}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Đơn vị</div>
              <div>{medicine.unit || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Dạng bào chế</div>
              <div>{medicine.form || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Đường dùng</div>
              <div>{medicine.route || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Hàm lượng</div>
              <div>{medicine.strength || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Giá</div>
              <div>{Number(medicine.price || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Tồn kho</div>
              <div>{medicine.quantity ?? 0}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Hạn dùng</div>
              <div>
                {medicine.expiryDate
                  ? new Date(medicine.expiryDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Hãng sản xuất</div>
              <div>{medicine.manufacturer || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Phân loại</div>
              <div>{medicine.isPrescription ? "Cần đơn (Rx)" : "OTC"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Người tạo</div>
              <div>{medicine.creator?.name || `#${medicine.createdBy}`}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-gray-500">Mô tả / Ghi chú</div>
              <div className="whitespace-pre-wrap">
                {medicine.description || "-"}
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                Tạo lúc:{" "}
                <b>
                  {medicine.createdAt
                    ? new Date(medicine.createdAt).toLocaleString()
                    : "-"}
                </b>
              </div>
              <div>
                Cập nhật:{" "}
                <b>
                  {medicine.updatedAt
                    ? new Date(medicine.updatedAt).toLocaleString()
                    : "-"}
                </b>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
