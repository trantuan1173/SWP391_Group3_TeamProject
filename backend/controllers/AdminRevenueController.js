const { Op } = require("sequelize");
const Payment = require("../models/Payment");

function buildSimpleWhere(from, to) {
  const where = { status: "paid" };

  if (from && to) {
    where.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
  } else if (from) {
    where.createdAt = { [Op.gte]: new Date(from) };
  } else if (to) {
    where.createdAt = { [Op.lte]: new Date(to) };
  }

  return where;
}

const getRevenueSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = buildSimpleWhere(from, to);

    const totalRevenue = (await Payment.sum("amount", { where })) || 0;
    const totalPayments = (await Payment.count({ where })) || 0;

    const now = new Date();
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0
      )
    );
    const end = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59
      )
    );

    const todayWhere = {
      status: "paid",
      createdAt: { [Op.between]: [start, end] },
    };
    const todayRevenue =
      (await Payment.sum("amount", { where: todayWhere })) || 0;

    res.json({
      totalRevenue,
      totalPayments,
      averageTicket: totalPayments ? totalRevenue / totalPayments : 0,
      todayRevenue,
      range: { from: from || null, to: to || null },
    });
  } catch (error) {
    console.error("getRevenueSummary error:", error);
    res.status(500).json({ error: "Lỗi khi tính doanh thu (summary)" });
  }
};

const getRevenueByMethod = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = buildSimpleWhere(from, to);

    const payments = await Payment.findAll({
      where,
      attributes: ["id", "amount", "method"],
      raw: true,
    });

    const totals = {};
    for (const p of payments) {
      const key = p.method || "unknown";

      if (!totals[key]) {
        totals[key] = { method: key, revenue: 0, count: 0 };
      }

      totals[key].revenue += Number(p.amount || 0);
      totals[key].count += 1;
    }

    const result = Object.values(totals).sort((a, b) => b.revenue - a.revenue);

    res.json(result);
  } catch (error) {
    console.error("getRevenueByMethod error:", error);
    res.status(500).json({ error: "Lỗi khi tính doanh thu theo phương thức" });
  }
};

const getRevenueTimeseries = async (req, res) => {
  try {
    const { from, to, granularity = "day" } = req.query;
    const where = buildSimpleWhere(from, to);

    const payments = await Payment.findAll({
      where,
      attributes: ["id", "amount", "createdAt"],
      raw: true,
    });

    const totals = {};
    for (const p of payments) {
      const d = new Date(p.createdAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      const key =
        granularity === "month"
          ? `${year}-${month}`
          : `${year}-${month}-${day}`;

      if (!totals[key]) {
        totals[key] = { bucket: key, revenue: 0, payments: 0 };
      }

      totals[key].revenue += Number(p.amount || 0);
      totals[key].payments += 1;
    }

    const result = Object.values(totals).sort((a, b) =>
      a.bucket.localeCompare(b.bucket)
    );

    res.json(result);
  } catch (error) {
    console.error("getRevenueTimeseries error:", error);
    res.status(500).json({ error: "Lỗi khi tính doanh thu theo thời gian" });
  }
};

module.exports = {
  getRevenueSummary,
  getRevenueByMethod,
  getRevenueTimeseries,
};
