import React, { useEffect, useState } from "react";
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

function toYMD(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computeRange(rangeKey) {
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
  if (rangeKey === "7d") start.setDate(end.getDate() - 6);
  else if (rangeKey === "30d") start.setDate(end.getDate() - 29);
  else if (rangeKey === "90d") start.setDate(end.getDate() - 89);
  else if (rangeKey === "mtd") start.setDate(1);
  else if (rangeKey === "ytd") {
    start.setMonth(0, 1);
  }

  const granularity =
    rangeKey === "90d" || rangeKey === "ytd" ? "month" : "day";

  return {
    from: toYMD(start),
    to: toYMD(end),
    granularity,
  };
}

function fillMissingDays(series, from, to) {
  const map = Object.fromEntries(series.map((s) => [s.bucket, s]));
  const filled = [];
  let cur = new Date(from);
  const end = new Date(to);

  while (cur <= end) {
    const key = toYMD(cur);
    filled.push(map[key] || { bucket: key, revenue: 0, payments: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return filled;
}

export default function RevenueCharts() {
  const [range, setRange] = useState("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [granularity, setGranularity] = useState("day");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    averageTicket: 0,
    todayRevenue: 0,
  });
  const [series, setSeries] = useState([]);
  const [byMethod, setByMethod] = useState([]);

  useEffect(() => {
    const r = computeRange(range);
    setFrom(r.from);
    setTo(r.to);
    setGranularity(r.granularity);
  }, [range]);

  useEffect(() => {
    if (!from || !to) return;

    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const sum = await fetchRevenueSummary({ from, to });
        const ts = await fetchRevenueTimeseries({ from, to, granularity });
        const met = await fetchRevenueByMethod({ from, to });

        if (!isMounted) return;

        setSummary(sum || {});

        const cleanedSeries =
          granularity === "day"
            ? fillMissingDays(ts || [], from, to)
            : ts || [];

        setSeries(cleanedSeries);
        setByMethod(met || []);
      } catch (e) {
        if (isMounted) setError(e?.message || "Lỗi tải dữ liệu");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [from, to, granularity]);

  return (
    <div className="space-y-4">
      {/* Header + chọn range */}
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

      {/* Trạng thái */}
      {loading && <p className="text-sm text-gray-500">Đang tải dữ liệu…</p>}
      {error && <p className="text-sm text-red-600">Lỗi: {error}</p>}

      {/* 4 thẻ số (summary) */}
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

      {/* Biểu đồ đường: doanh thu theo thời gian */}
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

      {/* Biểu đồ cột: doanh thu theo phương thức */}
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
