const {MedicalRecord, Appointment, Patient, Employee, Service, MedicalRecordService } = require("../models");
const { Op } = require("sequelize");

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

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      attributes: ['id', 'name', 'email', 'phoneNumber', 'dateOfBirth', 'gender'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bệnh nhân thành công",
      data: patients
    });
  } catch (error) {
    console.error("Error in getAllPatients:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get patients",
      details: error.message 
    });
  }
};

// controllers/MedicalRecordController.js
const getAllMedicalRecordsByPatient = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId); // sửa lại nếu là req.params.id
    const medicalRecords = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        {
          model: Employee,
          attributes: ['id', 'name', 'email', 'phoneNumber']
        },
        {
          model: Appointment,
          attributes: ['id', 'date', 'startTime', 'endTime', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedRecords = medicalRecords.map(record => {
      let orderDetails = [];
      if (typeof record.orderDetails === 'string') {
        try {
          orderDetails = JSON.parse(record.orderDetails);
        } catch {
          orderDetails = [];
        }
      } else if (Array.isArray(record.orderDetails)) {
        orderDetails = record.orderDetails;
      }
      return {
        ...record.toJSON(),
        orderDetails,
        doctor: record.Employee,
        appointment: record.Appointment
      };
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách hồ sơ khám thành công",
      data: formattedRecords
    });
  } catch (error) {
    console.error("Error in getAllMedicalRecordsByPatient:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get medical records",
      details: error.message 
    });
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

const getMedicalRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientId } = req.query;

    console.log("Getting medical records for doctorId:", doctorId, "patientId:", patientId); // Debug

    // Kiểm tra xem doctorId có khớp với user đang đăng nhập không
    if (req.userId && req.userId !== parseInt(doctorId)) {
      return res.status(403).json({ 
        success: false,
        error: "Bạn chỉ có thể xem hồ sơ của bệnh nhân mà bạn đã khám" 
      });
    }

    const whereConditions = { doctorId: parseInt(doctorId) };
    if (patientId) {
      whereConditions.patientId = parseInt(patientId);
    }

    console.log("Where conditions:", whereConditions); // Debug

    const medicalRecords = await MedicalRecord.findAll({
      where: whereConditions,
      include: [
        {
          model: Patient,
          attributes: ['id', 'name', 'email', 'phoneNumber', 'dateOfBirth', 'gender']
        },
        {
          model: Appointment,
          attributes: ['id', 'date', 'startTime', 'endTime', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log("Found medical records:", medicalRecords.length); // Debug

    const formattedRecords = medicalRecords.map(record => ({
      id: record.id,
      appointmentId: record.appointmentId,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      orderDetails: typeof record.orderDetails === 'string' 
        ? JSON.parse(record.orderDetails) 
        : (record.orderDetails || []),
      createdAt: record.createdAt,
      patient: record.Patient,
      appointment: record.Appointment
    }));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách hồ sơ khám thành công",
      data: formattedRecords
    });
  } catch (error) {
    console.error("Error in getMedicalRecordsByDoctor:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get medical records",
      details: error.message 
    });
  }
};

const getPatientsByDoctorV = async (req, res) => {
  try {
    const { doctorId } = req.params;

    console.log("Getting patients for doctorId:", doctorId); // Debug
    console.log("Request userId:", req.userId); // Debug

    // Kiểm tra quyền truy cập
    if (req.userId && req.userId !== parseInt(doctorId)) {
      return res.status(403).json({ 
        success: false,
        error: "Bạn chỉ có thể xem danh sách bệnh nhân của mình" 
      });
    }

    // Lấy danh sách appointments của doctor
    const appointments = await Appointment.findAll({
      where: { 
        doctorId: parseInt(doctorId),
        status: { [Op.in]: ['confirmed', 'completed'] }
      },
      attributes: ['patientId'],
      group: ['patientId'],
      raw: true
    });

    console.log("Found appointments:", appointments); // Debug

    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Chưa có bệnh nhân nào",
        data: []
      });
    }

    // Lấy danh sách patientIds
    const patientIds = appointments.map(a => a.patientId);
    console.log("Patient IDs:", patientIds); // Debug

    // Lấy thông tin bệnh nhân
    const patients = await Patient.findAll({
      where: {
        id: { [Op.in]: patientIds }
      },
      attributes: ['id', 'name', 'email', 'phoneNumber', 'dateOfBirth', 'gender']
    });

    console.log("Found patients:", patients.length); // Debug

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bệnh nhân thành công",
      data: patients
    });
  } catch (error) {
    console.error("Error in getPatientsByDoctor:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get patients",
      details: error.message 
    });
  }
};



    // backend/controllers/MedicalRecordController.js

const getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    console.log("Getting patients for doctorId:", doctorId);

    // Kiểm tra quyền truy cập
    if (req.userId && req.userId !== parseInt(doctorId)) {
      return res.status(403).json({ 
        success: false,
        error: "Bạn chỉ có thể xem danh sách bệnh nhân của mình" 
      });
    }

    // Lấy danh sách appointments đang active của doctor
    const appointments = await Appointment.findAll({
      where: { 
        doctorId: parseInt(doctorId),
        status: { [Op.in]: ['confirmed', 'pending'] },
        date: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        }
      },
      include: [
        {
          model: Patient,
          attributes: ['id', 'name', 'email', 'phoneNumber', 'dateOfBirth', 'gender'],
          required: true // Đảm bảo chỉ lấy appointment có patient
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    console.log("Found appointments:", appointments.length);

    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Chưa có lịch hẹn nào",
        data: []
      });
    }

    // Format data - ĐẢM BẢO CÓ ĐẦY ĐỦ THÔNG TIN
    const patientsWithAppointments = appointments.map(apt => {
      if (!apt.Patient) {
        console.error("Missing patient data for appointment:", apt.id);
        return null;
      }
      
      return {
        appointmentId: apt.id,
        appointmentDate: apt.date,
        appointmentTime: `${apt.startTime} - ${apt.endTime}`,
        appointmentStatus: apt.status,
        patientId: apt.Patient.id,
        patientName: apt.Patient.name || 'Không có tên',
        patientEmail: apt.Patient.email || '',
        patientPhone: apt.Patient.phoneNumber || '',
        patientDOB: apt.Patient.dateOfBirth || '',
        patientGender: apt.Patient.gender || ''
      };
    }).filter(item => item !== null); // Loại bỏ các item null

    console.log("Formatted patients:", patientsWithAppointments);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bệnh nhân thành công",
      data: patientsWithAppointments
    });
  } catch (error) {
    console.error("Error in getPatientsByDoctor:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get patients",
      details: error.message 
    });
  }
};




module.exports = {
    getAllPatients,
    getAllMedicalRecordByPatientId,
    getAllMedicalRecordByAppointmentId,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getMedicalRecordsByDoctor,
    getPatientsByDoctorV,
    getPatientsByDoctor,
    getAllMedicalRecordsByPatient
};
