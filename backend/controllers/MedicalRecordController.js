const { MedicalRecord, Appointment, Patient, Employee, Service, MedicalRecordService } = require("../models");

const getAllMedicalRecordByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;
    const medicalRecords = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Appointment, attributes: ["id", "date", "startTime", "endTime"] },
      ],
    });
    res.status(200).json({
      message: "Lấy danh sách hồ sơ khám thành công",
      data: medicalRecords.map((medicalRecord) => ({
        ...medicalRecord.dataValues,
        orderDetails: JSON.parse(medicalRecord.orderDetails),
      })),
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get medical records" });
    }
};

const getAllMedicalRecordByAppointmentId = async (req, res) => {
    try {
        const { appointmentId } = req.params;
    const medicalRecords = await MedicalRecord.findAll({
      where: { appointmentId },
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Appointment, attributes: ["id", "date", "startTime", "endTime"] },
      ],
    });
    res.status(200).json({
      message: "Lấy danh sách hồ sơ khám thành công",
      data: medicalRecords.map((medicalRecord) => ({
        ...medicalRecord.dataValues,
        orderDetails: JSON.parse(medicalRecord.orderDetails),
      })),
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get medical records" });
    }
};

const getMedicalRecordById = async (req, res) => {
    try {
        const { id } = req.params;
    const medicalRecord = await MedicalRecord.findByPk(id, {
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Appointment, attributes: ["id", "date", "startTime", "endTime"] },
      ],
    });
        if (!medicalRecord) {
            return res.status(404).json({ error: "Medical record not found" });
        }
        res.status(200).json({
            message: "Lấy thông tin hồ sơ khám thành công",
            data: {
                ...medicalRecord.dataValues,
                orderDetails: JSON.parse(medicalRecord.orderDetails),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get medical record" });
    }
};

const createMedicalRecord = async (req, res) => {

  const { patientId, doctorId, appointmentId, symptoms, diagnosis, treatment, services } = req.body;
    try {
    // If doctorId provided, ensure it references an Employee
    if (doctorId) {
      const doc = await Employee.findByPk(doctorId);
      if (!doc) return res.status(400).json({ error: 'Invalid doctorId' });
    }
        const serviceIds = services.map(s => s.serviceId);
        const serviceList = await Service.findAll({
          where: { id: serviceIds },
          raw: true,
        });
  
        const orderDetails = serviceList.map(service => {
          const input = services.find(s => s.serviceId === service.id);
          return {
            serviceId: service.id,
            name: service.name,
            price: service.price,
            quantity: input.quantity,
            total: input.total ?? service.price * input.quantity,
          };
        });
  
        const record = await MedicalRecord.create({
          appointmentId,
          patientId,
          doctorId,
          symptoms,
          diagnosis,
          treatment,
          orderDetails: JSON.stringify(orderDetails),
        });
  
        const serviceData = orderDetails.map((s) => ({
          medicalRecordId: record.id,
          serviceId: s.serviceId,
          quantity: s.quantity,
          total: s.total,
        }));
        await MedicalRecordService.bulkCreate(serviceData);
  
        res.status(201).json({
          message: "Tạo hồ sơ khám thành công",
          data: {
            ...record.dataValues,
            orderDetails,
          },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create medical record" });
    }
};

const updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { symptoms, diagnosis, treatment, services } = req.body;
        const record = await MedicalRecord.findByPk(id);
        if (!record) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

      await record.update({ symptoms, diagnosis, treatment });

      if (services && services.length > 0) {
        await MedicalRecordService.destroy({ where: { medicalRecordId: id } });

        const serviceIds = services.map((s) => s.serviceId);
        const serviceList = await Service.findAll({
          where: { id: serviceIds },
          raw: true,
        });

        const orderDetails = serviceList.map((service) => {
          const input = services.find((s) => s.serviceId === service.id);
          return {
            serviceId: service.id,
            name: service.name,
            price: service.price,
            quantity: input.quantity,
            total: input.total ?? service.price * input.quantity,
          };
        });

        const newServices = orderDetails.map((s) => ({
          medicalRecordId: id,
          serviceId: s.serviceId,
          quantity: s.quantity,
          total: s.total,
        }));
        await MedicalRecordService.bulkCreate(newServices);

        await record.update({ orderDetails: JSON.stringify(orderDetails) });
      }

      res.json({
        message: "Cập nhật hồ sơ thành công",
        data: record,
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update medical record" });
    }
};

const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const medicalRecord = await MedicalRecord.findByPk(id);
        if (!medicalRecord) {
            return res.status(404).json({ error: "Medical record not found" });
        }
        await medicalRecord.destroy();
        res.status(200).json({ message: "Medical record deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete medical record" });
    }
};

module.exports = {
    getAllMedicalRecordByPatientId,
    getAllMedicalRecordByAppointmentId,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
};
