import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { toast } from "sonner";

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

import useDebounce from "@/hooks/useDebounce";
import { fetchTickets, fetchTicketsAdmin } from "@/api/ticketApi";

export default function TicketManagement() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      const data = await fetchTicketsAdmin({
        page: currentPage,
        pageSize,
        search: search.trim(),
        status: statusFilter,
        userId: userIdFilter || undefined,
      });
      setTickets(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Không thể tải danh sách ticket");
    }
  }, [currentPage, pageSize, search, statusFilter, userIdFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const statusBadge = (s) => (
    <span
      className={`px-2 py-1 text-xs rounded-2xl text-white ${
        s === "open"
          ? "bg-gray-500"
          : s === "in-progress"
          ? "bg-blue-500"
          : "bg-green-600"
      }`}
    >
      {s}
    </span>
  );

  return (
    <div className="bg-white h-full p-5 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold">Quản lý ticket</h4>
        <div className="flex gap-3">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="open">Open</option>
            <option value="in-progress">In-progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <Input
            type="text"
            placeholder="Lọc theo userId (tuỳ chọn)"
            value={userIdFilter}
            onChange={(e) => {
              setUserIdFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-[180px]"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        <Input
          type="text"
          placeholder="Tìm theo tiêu đề hoặc nội dung..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableCaption>Danh sách ticket</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>UserID</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((t, index) => (
            <TableRow key={t.id}>
              <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
              <TableCell>{t.userId}</TableCell>
              <TableCell className="max-w-[360px]">
                <div className="font-semibold truncate">{t.title}</div>
              </TableCell>
              <TableCell>{statusBadge(t.status)}</TableCell>
              <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 !rounded-md"
                  onClick={() => navigate(`/receptionist/tickets/${t.id}`)}
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                Không có ticket
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink asChild isActive={currentPage === i + 1}>
                  <button onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
