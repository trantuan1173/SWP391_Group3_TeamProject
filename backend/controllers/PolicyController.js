const { Op } = require("sequelize");
const Policy = require("../models/Policy");

const createPolicy = async (req, res) => {
  try {
    const { title, contentHtml, contentDelta, category, status, lastEditedBy } =
      req.body;

    if (!title || !contentHtml) {
      return res.status(400).json({ error: "Tiêu đề và nội dung là bắt buộc" });
    }

    const existing = await Policy.findOne({ where: { title, category } });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Chính sách đã tồn tại trong danh mục này" });
    }

    const policy = await Policy.create({
      title,
      contentHtml,
      contentDelta,
      category,
      status: status || "active",
      lastEditedBy,
    });

    res.status(201).json({ message: "Tạo chính sách thành công", policy });
  } catch (error) {
    console.error("createPolicy error:", error);
    res.status(500).json({ error: "Tạo chính sách thất bại" });
  }
};

const getPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";
    const category = req.query.category ? req.query.category.trim() : "";
    const offset = (page - 1) * pageSize;

    const whereCondition = {};

    if (search) {
      whereCondition.title = { [Op.like]: `%${search}%` };
    }
    if (category) {
      whereCondition.category = category;
    }

    const { rows: policies, count: total } = await Policy.findAndCountAll({
      where: whereCondition,
      order: [["updatedAt", "DESC"]],
      limit: pageSize,
      offset,
    });

    res.json({
      message: "Lấy danh sách chính sách thành công",
      policies,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("getPolicies error:", error);
    res.status(500).json({ error: "Lấy danh sách chính sách thất bại" });
  }
};

const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findByPk(id);

    if (!policy) {
      return res.status(404).json({ error: "Không tìm thấy chính sách" });
    }

    res.json(policy);
  } catch (error) {
    console.error("getPolicyById error:", error);
    res.status(500).json({ error: "Lấy chính sách thất bại" });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contentHtml, contentDelta, status, lastEditedBy } = req.body;

    const policy = await Policy.findByPk(id);
    if (!policy) {
      return res.status(404).json({ error: "Không tìm thấy chính sách" });
    }

    policy.title = title || policy.title;
    policy.contentHtml = contentHtml || policy.contentHtml;
    policy.contentDelta = contentDelta || policy.contentDelta;
    policy.status = status || policy.status;
    policy.lastEditedBy = lastEditedBy || policy.lastEditedBy;

    await policy.save();

    res.json({ message: "Cập nhật chính sách thành công", policy });
  } catch (error) {
    console.error("updatePolicy error:", error);
    res.status(500).json({ error: "Cập nhật chính sách thất bại" });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await Policy.findByPk(id);
    if (!policy) {
      return res.status(404).json({ error: "Không tìm thấy chính sách" });
    }

    await policy.destroy();
    res.json({ message: "Xoá chính sách thành công" });
  } catch (error) {
    console.error("deletePolicy error:", error);
    res.status(500).json({ error: "Xoá chính sách thất bại" });
  }
};

const getActivePolicyByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const policy = await Policy.findOne({
      where: { category, status: "active" },
      order: [["updatedAt", "DESC"]],
    });

    if (!policy) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy chính sách trong danh mục này" });
    }

    res.json(policy);
  } catch (error) {
    console.error("getActivePolicyByCategory error:", error);
    res.status(500).json({ error: "Không thể lấy chính sách" });
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  getActivePolicyByCategory,
};
