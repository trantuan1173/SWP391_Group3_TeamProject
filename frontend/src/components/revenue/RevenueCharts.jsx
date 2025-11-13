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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  fetchRevenueSummary,
  fetchRevenueTimeseries,
  fetchRevenueByMethod,
} from "@/api/dashboardRevenueApi";

const nfVN = new Intl.NumberFormat("vi-VN");

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function fillMissingDays(series, from, to) {
  const map = Object.fromEntries((series || []).map((s) => [s.bucket, s]));
  const out = [];
  let cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const k = toYMD(cur);
    out.push(map[k] || { bucket: k, revenue: 0, payments: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export default function RevenueCharts() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

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

  const invalidRange = useMemo(() => {
    if (!from || !to) return false;
    return new Date(from) > new Date(to);
  }, [from, to]);

  const computedParams = useMemo(() => {
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      return { from: toYMD(start), to: toYMD(end), granularity: "day" };
    }
    if (!month && year) {
      const start = new Date(Number(year), 0, 1);
      const end = new Date(Number(year), 11, 31);
      return { from: toYMD(start), to: toYMD(end), granularity: "month" };
    }
    if (from || to) return { from, to, granularity: "day" };

    const today = new Date();
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const start = new Date(end);
    start.setDate(end.getDate() - 29);
    return { from: toYMD(start), to: toYMD(end), granularity: "day" };
  }, [from, to, month, year]);

  async function load() {
    if ((from || to) && invalidRange) return;

    setLoading(true);
    setError("");
    try {
      const params = {};

      if (computedParams.from)
        params.from = `${computedParams.from}T00:00:00.000`;
      if (computedParams.to) params.to = `${computedParams.to}T23:59:59.999`;

      const [sum, ts, met] = await Promise.all([
        fetchRevenueSummary(params),
        fetchRevenueTimeseries({
          ...params,
          granularity: computedParams.granularity,
        }),
        fetchRevenueByMethod(params),
      ]);

      setGranularity(computedParams.granularity);
      setSummary(
        sum || {
          totalRevenue: 0,
          totalPayments: 0,
          averageTicket: 0,
          todayRevenue: 0,
        }
      );

      const tsClean =
        computedParams.granularity === "day"
          ? fillMissingDays(ts || [], computedParams.from, computedParams.to)
          : ts || [];
      setSeries(tsClean);
      setByMethod(met || []);
    } catch (e) {
      setError(e?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const moneyTick = (v) => nfVN.format(Math.round(v || 0));

  const tooltipContent = (p) => {
    if (!p.active || !p.payload?.length) return null;
    const d = p.payload[0].payload;
    return (
      <div className="rounded-xl border bg-white p-3 text-sm shadow">
        <div className="font-medium">{d.bucket}</div>
        <div>Doanh thu: {nfVN.format(d.revenue)}</div>
        <div>Số GD: {nfVN.format(d.payments)}</div>
      </div>
    );
  };

  const years = (() => {
    const y = new Date().getFullYear();
    const arr = [];
    for (let k = y + 1; k >= y - 5; k--) arr.push(String(k));
    return arr;
  })();

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Thống kê doanh thu</h3>

      {/* Bộ lọc */}
      <div className="w-full rounded-lg border p-3 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* From */}
          <div className="md:col-span-3">
            <label className="text-sm text-muted-foreground">From</label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={month || year}
              max={to || undefined}
            />
          </div>

          {/* To */}
          <div className="md:col-span-3">
            <label className="text-sm text-muted-foreground">To</label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={month || year}
              min={from || undefined}
            />
          </div>

          {/* Tháng */}
          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">Tháng</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const mm = String(i + 1).padStart(2, "0");
                  return (
                    <SelectItem key={mm} value={mm}>
                      {mm}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Năm */}
          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">Năm</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nút */}
          <div className="md:col-span-2 flex gap-2 md:justify-end">
            <Button
              className="w-full md:w-auto"
              onClick={() => {
                if (invalidRange) return;
                if (month || year) {
                  setFrom("");
                  setTo("");
                }
                load();
              }}
              disabled={loading || invalidRange}
            >
              {loading ? "Đang tải..." : "Search"}
            </Button>
            <Button
              className="w-full md:w-auto"
              variant="secondary"
              onClick={() => {
                setFrom("");
                setTo("");
                setMonth("");
                setYear("");
                load();
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* cảnh báo range sai */}
        {invalidRange && (
          <p className="mt-2 text-sm text-red-600">
            Ngày <b>To</b> không được nhỏ hơn ngày <b>From</b>.
          </p>
        )}
      </div>

      {/* Trạng thái */}
      {loading && <p className="text-sm text-gray-500">Đang tải dữ liệu…</p>}
      {error && <p className="text-sm text-red-600">Lỗi: {error}</p>}

      {/* 4 thẻ số */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Tổng doanh thu</div>
            <div className="text-2xl font-bold">
              {nfVN.format(summary.totalRevenue || 0)}
            </div>
            <div className="text-xs text-gray-500">
              {computedParams.from} → {computedParams.to}
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Số giao dịch</div>
            <div className="text-2xl font-bold">
              {nfVN.format(summary.totalPayments || 0)}
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">TB / giao dịch</div>
            <div className="text-2xl font-bold">
              {nfVN.format(Math.round(summary.averageTicket || 0))}
            </div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-xs text-gray-500">Doanh thu hôm nay</div>
            <div className="text-2xl font-bold">
              {nfVN.format(summary.todayRevenue || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Biểu đồ đường */}
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
                <YAxis width={70} tickFormatter={moneyTick} />
                <Tooltip content={tooltipContent} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="payments"
                  name="Số GD"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Biểu đồ cột */}
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
                <YAxis width={70} tickFormatter={moneyTick} />
                <Tooltip
                  formatter={(v, k) =>
                    k === "revenue"
                      ? [nfVN.format(v), "Doanh thu"]
                      : [nfVN.format(v), "Số GD"]
                  }
                />
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
