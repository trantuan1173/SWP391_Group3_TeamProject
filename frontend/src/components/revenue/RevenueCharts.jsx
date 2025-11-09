import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  fetchRevenueSummary,
  fetchRevenueTimeseries,
  fetchRevenueByMethod,
} from "@/api/dashboardRevenueApi";

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function RevenueCharts() {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    averageTicket: 0,
    todayRevenue: 0,
  });
  const [series, setSeries] = useState([]);
  const [byMethod, setByMethod] = useState([]);

  const { from, to, granularity } = useMemo(() => {
    const now = new Date();
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const start = new Date(end);
    if (range === "7d") start.setDate(end.getDate() - 6);
    else if (range === "30d") start.setDate(end.getDate() - 29);
    else if (range === "90d") start.setDate(end.getDate() - 89);
    else if (range === "mtd") start.setDate(1);
    else if (range === "ytd") start.setMonth(0, 1);
    const gran = range === "90d" || range === "ytd" ? "month" : "day";
    return { from: fmtDate(start), to: fmtDate(end), granularity: gran };
  }, [range]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [sum, ts, methods] = await Promise.all([
          fetchRevenueSummary({ from, to }),
          fetchRevenueTimeseries({ from, to, granularity }),
          fetchRevenueByMethod({ from, to }),
        ]);

        if (!alive) return;
        setSummary(sum || {});
        setSeries(ts || []);
        setByMethod(methods || []);
      } catch (e) {
        if (alive) setError(e.message || "Lỗi tải dữ liệu");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [from, to, granularity]);

  return (
    <div className="space-y-4">
      {/* header + preset range */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Thống kê doanh thu</h3>
        <div className="flex gap-2">
          {["7d", "30d", "90d", "mtd", "ytd"].map((k) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`px-3 py-1 rounded border ${
                range === k ? "bg-black text-white" : "bg-white"
              }`}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Đang tải dữ liệu…</p>}
      {error && <p className="text-sm text-red-600">Lỗi: {error}</p>}

      {/* summary cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Tổng doanh thu</div>
            <div className="text-2xl font-bold">
              {Number(summary.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {from} → {to}
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Số giao dịch</div>
            <div className="text-2xl font-bold">
              {Number(summary.totalPayments || 0).toLocaleString()}
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">TB / giao dịch</div>
            <div className="text-2xl font-bold">
              {Math.round(Number(summary.averageTicket || 0)).toLocaleString()}
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Doanh thu hôm nay</div>
            <div className="text-2xl font-bold">
              {Number(summary.todayRevenue || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* line chart: revenue over time */}
      {!loading && !error && (
        <div className="p-4 border rounded">
          <div className="mb-2 font-semibold">
            Doanh thu theo {granularity === "day" ? "ngày" : "tháng"}
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart
                data={series}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="payments"
                  name="Số GD"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* bar chart: revenue by method */}
      {!loading && !error && (
        <div className="p-4 border rounded">
          <div className="mb-2 font-semibold">Doanh thu theo phương thức</div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={byMethod}
                margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" />
                <Bar dataKey="count" name="Số GD" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
