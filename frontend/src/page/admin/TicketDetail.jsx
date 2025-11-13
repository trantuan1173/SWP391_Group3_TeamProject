import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchTicketById,
  updateTicketStatus,
  answerTicket,
  deleteTicket,
} from "@/api/ticketApi";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTicketById(id);
      setTicket(data);
      setAnswer(data.answer || "");
    } catch {
      toast.error("Không tải được ticket");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleTake = async () => {
    if (!ticket || ticket.status !== "open") return;
    const tid = toast.loading("Đang nhận xử lý…");
    try {
      await updateTicketStatus(ticket.id, "in-progress");
      toast.success("Đã chuyển sang In-progress", { id: tid });
      load();
    } catch {
      toast.error("Nhận xử lý thất bại", { id: tid });
    }
  };

  const handleSend = async (closeAfter = false) => {
    if (!answer.trim()) return toast.error("Vui lòng nhập nội dung trả lời");
    const tid = toast.loading("Đang gửi trả lời…");
    try {
      await answerTicket(
        ticket.id,
        answer.trim(),
        closeAfter ? "resolved" : undefined
      );
      toast.success("Đã gửi trả lời", { id: tid });
      load();
    } catch {
      toast.error("Gửi trả lời thất bại", { id: tid });
    }
  };

  const handleDelete = async () => {
    if (ticket.status !== "open") {
      return toast.error("Chỉ xóa được khi ticket đang OPEN");
    }
    const tid = toast.loading("Đang xóa ticket…");
    try {
      await deleteTicket(ticket.id);
      toast.success("Đã xóa ticket", { id: tid });
      navigate("/receptionist/tickets");
    } catch {
      toast.error("Xóa ticket thất bại", { id: tid });
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải…</div>;
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <div className="mt-4 text-red-500">Không tìm thấy ticket</div>
      </div>
    );
  }

  const isResolved = ticket.status === "resolved";

  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        ← Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{ticket.title}</h2>
            </div>

            <div className="flex items-center gap-3 mt-2">
              {statusBadge(ticket.status)}
              <span className="text-sm text-gray-500">
                Created {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Question</h3>
              <div className="border rounded-md p-3 bg-gray-50 text-sm">
                {ticket.content}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">From User</h3>
              <div className="border rounded-md p-3 bg-gray-50 text-sm flex items-center gap-3">
                <div className="font-medium bg-amber-300 px-2 py-1 rounded-lg text-xs">
                  {ticket.user.email ? ticket.user.email : "null"}
                </div>
                <div className="font-bold">
                  {ticket.user.name ? ticket.user.name : "not assigned"}
                </div>
              </div>
            </div>

            {ticket.answer && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Answer</h3>
                <div className="border rounded-md p-3 bg-green-50 text-sm">
                  {ticket.answer}
                </div>
              </div>
            )}

            {!isResolved && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Your Response</h3>
                <Textarea
                  placeholder="Nhập câu trả lời chi tiết tại đây…"
                  className="min-h-[140px]"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleSend(false)}
                  >
                    Send Response
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleSend(true)}
                  >
                    Trả lời & Đóng
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAnswer(ticket.answer || "")}
                  >
                    Clear
                  </Button>
                  <div className="ml-auto flex gap-2">
                    {/* {ticket.status === "open" && (
                      <Button variant="secondary" onClick={handleTake}>
                        Nhận xử lý (in-progress)
                      </Button>
                    )} */}
                    {ticket.status === "open" && (
                      <Button variant="destructive" onClick={handleDelete}>
                        Xóa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: info panel */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-5">
            <h3 className="font-semibold mb-4">Question Information</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-mono">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span>{statusBadge(ticket.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* <div className="rounded-lg border bg-white p-5">
            <h3 className="font-semibold mb-4">Assignment</h3>
            {ticket.status === "open" ? (
              <Button className="w-full" onClick={handleTake}>
                ASSIGN TO ME
              </Button>
            ) : (
              <div className="text-center text-green-700 text-sm font-semibold">
                {ticket.answeredBy
                  ? `ASSIGNED TO ${ticket.answeredByEmployee.name.toUpperCase()}`
                  : "IN PROGRESS"}
              </div>
            )}
            {ticket.status === "in-progress" && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Ticket đang được xử lý. Bạn có thể gửi trả lời ở khung bên trái.
              </p>
            )}
            {isResolved && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Ticket đã được đóng. Bạn không thể cập nhật trả lời.
              </p>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}
