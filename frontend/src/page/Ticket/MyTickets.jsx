import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import TicketFormDialog from "@/components/ticket/TicketFormDialog";
import DeleteConfirmDialog from "@/components/users/DeleteConfirmDialog";
import { fetchTickets, createTicket, deleteTicket } from "@/api/ticketApi";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import useDebounce from "@/hooks/useDebounce";

export default function MyTickets() {
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchTickets({ page, pageSize, search, status });
      console.log("Fetched tickets:", data);
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Không thể tải danh sách ticket");
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (payload) => {
    const id = toast.loading("Đang gửi ticket...");
    try {
      await createTicket(payload);
      toast.success("Gửi ticket thành công!", { id });
      setDialogOpen(false);
      setPage(1);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Gửi ticket thất bại", { id });
    }
  };

  const askDelete = (row) => {
    setSelected(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    if (selected.status !== "open") {
      toast.error("Chỉ được xóa khi ticket đang ở trạng thái OPEN");
      setDeleteDialogOpen(false);
      setSelected(null);
      return;
    }
    const id = toast.loading("Đang xóa ticket...");
    try {
      await deleteTicket(selected.id);
      toast.success("Xóa ticket thành công", { id });
      load();
    } catch {
      toast.error("Xóa ticket thất bại", { id });
    } finally {
      setDeleteDialogOpen(false);
      setSelected(null);
    }
  };

  return (
    <div className="bg-white h-full p-5 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold">Ticket của tôi</h4>
        <div className="flex gap-3">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600 !rounded-md"
          >
            Gửi ticket
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Tìm theo tiêu đề hoặc nội dung..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Table>
        <TableCaption>Danh sách ticket của bạn</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Trả lời</TableHead>
            <TableHead>Thao tác</TableHead>
            <TableHead>Trả lời bởi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t, idx) => (
            <TableRow key={t.id}>
              <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
              <TableCell className="font-semibold">{t.title}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs rounded-2xl text-white ${
                    t.status === "open"
                      ? "bg-gray-500"
                      : t.status === "in-progress"
                      ? "bg-blue-500"
                      : "bg-green-600"
                  }`}
                >
                  {t.status}
                </span>
              </TableCell>
              <TableCell className="max-w-[420px] truncate">
                {t.answer ? (
                  t.answer
                ) : (
                  <span className="text-gray-400">Chưa có</span>
                )}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className={`!rounded-md ${
                    t.status !== "open" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() =>
                    t.status === "open"
                      ? askDelete(t)
                      : toast.error("Chỉ xóa được khi ticket OPEN")
                  }
                >
                  Xóa
                </Button>
              </TableCell>
              <TableCell>
                <p>
                  {t.answeredByEmployee.name
                    ? t.answeredByEmployee.name
                    : "Chưa có"}
                </p>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                Chưa có ticket nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink asChild isActive={page === i + 1}>
                  <button onClick={() => setPage(i + 1)}>{i + 1}</button>
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Dialogs */}
      <TicketFormDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onSubmit={handleCreate}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        user={{ name: selected?.title }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
