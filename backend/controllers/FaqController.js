const { Category } = require("../models");
const Faq = require("../models/Faq");
const Ticket = require("../models/Ticket");
const { Op } = require("sequelize");

const getCategorySummary = async (req, res) => {
  try {
    const cats = await Category.findAll({
      where: { isDeleted: false },
      attributes: ["id", "name", "description"],
      include: [{ model: Faq, as: "faqs", attributes: ["id"] }],
      order: [["name", "ASC"]],
    });
    const result = cats.map((c) => ({
      id: c.id,
      category: c.name,
      description: c.description,
      count: c.faqs?.length || 0,
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Không lấy được category summary" });
  }
};

const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    if (!faq) return res.status(404).json({ error: "Không tìm thấy FAQ" });

    faq.views = (faq.views || 0) + 1;
    await faq.save({ fields: ["views"] });

    res.json(faq);
  } catch (err) {
    console.error("getFaqById error:", err);
    res.status(500).json({ error: "Lấy chi tiết FAQ thất bại" });
  }
};

const listFaq = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";
    const category = req.query.category ? req.query.category.trim() : "";
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId)
      : null;

    const offset = (page - 1) * pageSize;

    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    const includeCategory = {
      model: Category,
      as: "category",
      attributes: ["id", "name"],
      required: !!category,
      where: category ? { name: { [Op.like]: `%${category}%` } } : undefined,
    };

    const { rows: faqs, count: total } = await Faq.findAndCountAll({
      attributes: [
        "id",
        "title",
        "content",
        "views",
        "createdAt",
        "categoryId",
      ],
      include: [includeCategory],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
      subQuery: false,
    });

    res.json({
      message: "Lấy danh sách FAQ",
      items: faqs,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (err) {
    console.error("listFaq error:", err);
    res.status(500).json({ error: "Không lấy được danh sách FAQ" });
  }
};

const createFaq = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    if (!title || !categoryId)
      return res.status(400).json({ error: "Thiếu title hoặc categoryId" });

    const category = await Category.findByPk(categoryId);
    if (!category)
      return res.status(404).json({ error: "Category không tồn tại" });

    const faq = await Faq.create({
      title,
      content,
      categoryId,
      createdBy: req.user?.id || null,
    });

    res.status(201).json({ message: "Tạo FAQ thành công", faq });
  } catch (err) {
    console.error("createFaq error:", err);
    res.status(500).json({ error: "Tạo FAQ thất bại" });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ không tồn tại" });

    await faq.destroy();
    res.json({ message: "Xóa FAQ thành công" });
  } catch (err) {
    console.error("deleteFaq error:", err);
    res.status(500).json({ error: "Xóa FAQ thất bại" });
  }
};

module.exports = {
  getCategorySummary,
  listFaq,
  getFaqById,
  createFaq,
  deleteFaq,
};
