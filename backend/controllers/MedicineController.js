const { Op } = require("sequelize");
const Medicine = require("../models/Medicine");
const Employee = require("../models/Employee");

// ===== Create Medicine =====
const createMedicine = async (req, res) => {
  try {
    const {
      name,
      description,
      unit,
      form,
      route,
      strength,
      price,
      quantity,
      expiryDate,
      manufacturer,
      isPrescription,
    } = req.body;

    const createdBy = req.userId;

    if (req.userType !== "employee") {
      return res.status(403).json({
        error: "Chỉ nhân viên mới được phép thêm thuốc",
      });
    }

    if (!name || !unit || !createdBy) {
      return res
        .status(400)
        .json({ error: "Tên thuốc, đơn vị và người tạo là bắt buộc" });
    }

    const medicine = await Medicine.create({
      name,
      description,
      unit,
      form,
      route,
      strength,
      price,
      quantity,
      expiryDate,
      manufacturer,
      isPrescription,
      createdBy,
    });

    res.status(201).json({ message: "Thuốc tạo thành công", medicine });
  } catch (error) {
    console.error("createMedicine error:", error);
    res.status(500).json({ error: "Tạo thuốc thất bại" });
  }
};

// ===== Get All Medicines (with pagination + search) =====
const getMedicines = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    const offset = (page - 1) * pageSize;

    const whereCondition = {};
    if (search) {
      whereCondition.name = { [Op.like]: `%${search}%` };
    }

    const { rows: medicines, count: total } = await Medicine.findAndCountAll({
      where: whereCondition,
      include: [{ model: Employee, as: "creator", attributes: ["id", "name"] }],
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Lấy danh sách thuốc thành công",
      medicines,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("getMedicines error:", error);
    res.status(500).json({ error: "Lấy danh sách thuốc thất bại" });
  }
};

// ===== Get Medicine by ID =====
const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByPk(id, {
      include: [{ model: Employee, as: "creator", attributes: ["id", "name"] }],
    });

    if (!medicine)
      return res.status(404).json({ error: "Không tìm thấy thuốc" });

    res.json(medicine);
  } catch (error) {
    console.error("getMedicineById error:", error);
    res.status(500).json({ error: "Lấy thông tin thuốc thất bại" });
  }
};

// ===== Update Medicine =====
const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const medicine = await Medicine.findByPk(id);
    if (!medicine)
      return res.status(404).json({ error: "Không tìm thấy thuốc" });

    await medicine.update(updateData);

    res.json({ message: "Cập nhật thuốc thành công", medicine });
  } catch (error) {
    console.error("updateMedicine error:", error);
    res.status(500).json({ error: "Cập nhật thuốc thất bại" });
  }
};

// ===== Delete Medicine =====
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByPk(id);

    if (!medicine)
      return res.status(404).json({ error: "Không tìm thấy thuốc" });

    await medicine.destroy();

    res.json({ message: "Thuốc đã được xoá thành công" });
  } catch (error) {
    console.error("deleteMedicine error:", error);
    res.status(500).json({ error: "Xoá thuốc thất bại" });
  }
};

// ===== Get Medicines Expiring Soon =====
const getExpiringMedicines = async (req, res) => {
  try {
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(now.getDate() + 30);

    const expiring = await Medicine.findAll({
      where: {
        expiryDate: { [Op.between]: [now, next30Days] },
      },
      order: [["expiryDate", "ASC"]],
    });

    res.json({ message: "Thuốc sắp hết hạn", expiring });
  } catch (error) {
    console.error("getExpiringMedicines error:", error);
    res
      .status(500)
      .json({ error: "Không thể lấy danh sách thuốc sắp hết hạn" });
  }
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getExpiringMedicines,
};
