import React, { useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_ENDPOINTS } from "@/config";

export default function CancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const appointmentId = searchParams.get("appointmentId");

    if (appointmentId) {
      axios
        .post(`${API_ENDPOINTS.DELETE_PAYMENT}`, {
          appointmentId,
        })
        .then((res) => {
          console.log("🗑️ Delete result:", res.data);
        })
        .catch((err) => {
          console.error("❌ Delete error:", err);
        });
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-4xl font-bold text-red-700 mb-4">
        Thanh toán đã bị hủy!
      </h1>
      <Button onClick={() => navigate("/")} variant="default">
        Quay lại trang chính
      </Button>
    </div>
  );
}
