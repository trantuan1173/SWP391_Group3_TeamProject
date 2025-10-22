const { Op } = require("sequelize");
const { Service } = require("../models");

const getAllService = async (req, res) => {
  try {
    const services = await Service.findAll({
      attributes: ["id", "name", "description", "price"],
      order: [["name", "ASC"]],
    });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách dịch vụ thành công",
      data: services,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const getAllServicePagination = async (req, res) => {
  try {
    // Lấy query params
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search ? req.query.search.trim() : "";
    const offset = (page - 1) * pageSize;

    // ===== VALIDATION =====
    if (page <= 0 || pageSize <= 0) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // ===== WHERE CONDITION =====
    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // ===== QUERY DATABASE =====
    const { rows: services, count: total } = await Service.findAndCountAll({
      attributes: [
        "id",
        "name",
        "description",
        "price",
        "createdAt",
        "updatedAt",
      ],
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // ===== RESPONSE =====
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách dịch vụ thành công",
      data: services,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("getAllServicePagination error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // ===== VALIDATION =====
    if (!name || !price) {
      return res.status(400).json({
        error: "Tên và giá dịch vụ là bắt buộc",
      });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        error: "Giá dịch vụ phải là số hợp lệ và lớn hơn 0",
      });
    }

    // Kiểm tra trùng tên
    const existingService = await Service.findOne({ where: { name } });
    if (existingService) {
      return res.status(409).json({
        error: "Tên dịch vụ đã tồn tại",
      });
    }

    const newService = await Service.create({
      name,
      description,
      price,
    });

    res.status(201).json({
      message: "Tạo dịch vụ thành công",
      service: newService,
    });
  } catch (error) {
    console.error("createService error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // ===== VALIDATION =====
    if (!name || !price) {
      return res.status(400).json({
        error: "Tên và giá dịch vụ là bắt buộc",
      });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        error: "Giá dịch vụ phải là số hợp lệ và lớn hơn 0",
      });
    }

    // Kiểm tra trùng tên (ngoại trừ chính service hiện tại)
    const duplicateName = await Service.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });
    if (duplicateName) {
      return res.status(409).json({
        error: "Tên dịch vụ đã tồn tại",
      });
    }

    await service.update({ name, description, price });

    res.status(200).json({
      message: "Cập nhật dịch vụ thành công",
      service,
    });
  } catch (error) {
    console.error("updateService error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    await service.destroy();
    res.json({ message: "Xóa dịch vụ thành công" });
  } catch (error) {
    console.error("deleteService error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllService,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAllServicePagination,
};
