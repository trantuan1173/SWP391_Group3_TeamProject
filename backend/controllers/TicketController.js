const { Op } = require("sequelize");
const { Ticket, Patient, Employee, Category } = require("../models");

const createTicket = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Thiếu title hoặc content" });

    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(400).json({ error: "Thiếu userId" });

    const ticket = await Ticket.create({
      userId,
      title: title.trim(),
      content: content.trim(),
      status: "open",
    });

    res.status(201).json({ message: "Tạo ticket thành công", ticket });
  } catch (err) {
    console.error("createTicket error:", err);
    res.status(500).json({ error: "Tạo ticket thất bại" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);

    const ticket = await Ticket.findByPk(id, {
      attributes: [
        "id",
        "userId",
        "title",
        "content",
        "status",
        "answer",
        "answeredBy",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Patient,
          as: "user",
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: Employee,
          as: "answeredByEmployee",
          attributes: ["id", "name", "email"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    if (!ticket)
      return res.status(404).json({ error: "Không tìm thấy ticket" });

    // owner chỉ là patient tạo ticket
    const isOwner = req.userType === "patient" && ticket.userId === req.user.id;

    // nhân viên có quyền nếu là receptionist / admin
    const roles = req.user?.roleNamesLower || [];
    const canStaff = roles.includes("receptionist") || roles.includes("admin");

    if (!(isOwner || canStaff)) {
      return res
        .status(403)
        .json({ error: "Không có quyền truy cập ticket này" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("getTicketById error:", err);
    res.status(500).json({ error: "Lấy chi tiết ticket thất bại" });
  }
};

const listTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const sort = req.query.sort === "ASC" ? "ASC" : "DESC";
    const offset = (page - 1) * pageSize;

    const whereCondition = {};

    if (req.userType === "patient") {
      whereCondition.userId = req.user.id;
    }

    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) whereCondition.status = status;

    const { rows: items, count: total } = await Ticket.findAndCountAll({
      attributes: [
        "id",
        "userId",
        "title",
        "content",
        "status",
        "answer",
        "answeredBy",
        "createdAt",
        "updatedAt",
      ],
      include: [
        { model: Patient, as: "user", attributes: ["id", "name", "email"] },
        {
          model: Employee,
          as: "answeredByEmployee",
          attributes: ["id", "name", "email"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", sort]],
      subQuery: false,
    });

    res.json({
      message: "Lấy danh sách ticket",
      items,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (err) {
    console.error("listTickets error:", err);
    res.status(500).json({ error: "Không lấy được danh sách ticket" });
  }
};

const listTicketsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "").trim();
    const userId = req.query.userId ? parseInt(req.query.userId) : null;
    const sort = req.query.sort === "ASC" ? "ASC" : "DESC";
    const offset = (page - 1) * pageSize;

    const whereCondition = {};
    if (userId) whereCondition.userId = userId;
    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) whereCondition.status = status;

    const { rows: items, count: total } = await Ticket.findAndCountAll({
      attributes: [
        "id",
        "userId",
        "title",
        "content",
        "status",
        "answer",
        "answeredBy",
        "createdAt",
        "updatedAt",
      ],
      include: [
        { model: Patient, as: "user", attributes: ["id", "name", "email"] },
        {
          model: Employee,
          as: "answeredByEmployee",
          attributes: ["id", "name", "email"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          required: false,
        },
      ],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", sort]],
      subQuery: false,
    });

    res.json({
      message: "Lấy danh sách ticket (admin)",
      items,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (err) {
    console.error("listTicketsAdmin error:", err);
    res.status(500).json({ error: "Không lấy được danh sách ticket (admin)" });
  }
};

const isStaff = (req) =>
  req.userType === "employee" &&
  (req.user?.roleNamesLower || []).some(
    (r) => r === "receptionist" || r === "admin"
  );

const updateTicketStatus = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Thiếu status" });

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket không tồn tại" });

    if (!isStaff(req)) {
      return res
        .status(403)
        .json({ error: "Không có quyền cập nhật trạng thái" });
    }

    ticket.status = status;
    await ticket.save({ fields: ["status"] });

    res.json({ message: "Cập nhật trạng thái thành công", ticket });
  } catch (err) {
    console.error("updateTicketStatus error:", err);
    res.status(500).json({ error: "Cập nhật trạng thái thất bại" });
  }
};

const answerTicket = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const { answer, status } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: "Thiếu nội dung trả lời" });
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket không tồn tại" });

    if (!isStaff(req)) {
      return res.status(403).json({ error: "Không có quyền trả lời ticket" });
    }

    ticket.answer = answer.trim();
    ticket.answeredBy = req.user?.id || null;
    if (status) ticket.status = status;

    await ticket.save({ fields: ["answer", "answeredBy", "status"] });

    res.json({ message: "Trả lời ticket thành công", ticket });
  } catch (err) {
    console.error("answerTicket error:", err);
    res.status(500).json({ error: "Trả lời ticket thất bại" });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket không tồn tại" });

    const role = req.user?.role || "user";
    const isOwner = req.user?.id && ticket.userId === req.user.id;
    const allowOwnerDeleteOpen = true;

    const canDelete =
      role === "admin" ||
      (allowOwnerDeleteOpen && isOwner && ticket.status === "open");

    if (!canDelete)
      return res.status(403).json({ error: "Không có quyền xóa ticket" });

    await ticket.destroy();
    res.json({ message: "Xóa ticket thành công" });
  } catch (err) {
    console.error("deleteTicket error:", err);
    res.status(500).json({ error: "Xóa ticket thất bại" });
  }
};

module.exports = {
  createTicket,
  getTicketById,
  listTickets,
  listTicketsAdmin,
  updateTicketStatus,
  answerTicket,
  deleteTicket,
};
