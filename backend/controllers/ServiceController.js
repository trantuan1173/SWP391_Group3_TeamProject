const { Service } = require("../models");

const getAllService = async (req, res) => {
    try {
        const services = await Service.findAll({
            attributes: ['id', 'name', 'description', 'price'],
            order: [['name', 'ASC']]
        });
        res.status(200).json({
            success: true,
            message: "Lấy danh sách dịch vụ thành công",
            data: services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            error: "Internal Server Error" 
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
        const service = await Service.create(req.body);
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }
        await service.update(req.body);
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }
        await service.destroy();
        res.json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getAllService,
    getServiceById,
    createService,
    updateService,
    deleteService
};