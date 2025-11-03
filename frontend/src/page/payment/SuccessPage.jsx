// SuccessPage.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Thanh toán thành công!
      </h1>
      <Button onClick={() => navigate("/")} variant="default">
        Quay lại trang chính
      </Button>
    </div>
  );
}
