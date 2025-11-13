const {
  MedicalRecord,
  Appointment,
  Patient,
  Employee,
  Service,
  MedicalRecordService,
  MedicalRecordMedicine,
  Medicine,
} = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const getAllMedicalRecordByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalRecords = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email", "phoneNumber", "avatar"],
        },
        {
          model: Appointment,
          attributes: ["id", "date", "startTime", "endTime"],
        },
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
      attributes: [
        "id",
        "name",
        "email",
        "phoneNumber",
        "dateOfBirth",
        "gender",
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bệnh nhân thành công",
      data: patients,
    });
  } catch (error) {
    console.error("Error in getAllPatients:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get patients",
      details: error.message,
    });
  }
};

const getAllMedicalRecordsByPatient = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const medicalRecords = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: Appointment,
          attributes: ["id", "date", "startTime", "endTime", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedRecords = medicalRecords.map((record) => {
      let orderDetails = [];
      if (typeof record.orderDetails === "string") {
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
        appointment: record.Appointment,
      };
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách hồ sơ khám thành công",
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Error in getAllMedicalRecordsByPatient:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get medical records",
      details: error.message,
    });
  }
};

const searchMedicalRecord = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const patients = await Patient.findAll({
      where: search
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
              { phoneNumber: { [Op.like]: `%${search}%` } },
            ],
          }
        : undefined,
      include: [
        {
          model: MedicalRecord,
          attributes: [
            "id",
            "appointmentId",
            "patientId",
            "doctorId",
            "symptoms",
            "diagnosis",
            "treatment",
            "orderDetails",
            "createdAt",
          ],
          include: [
            {
              model: Employee,
              attributes: ["id", "name", "email", "phoneNumber"],
            }, // không dùng alias
            {
              model: Appointment,
              attributes: [
                "id",
                "doctorId",
                "patientId",
                "date",
                "startTime",
                "endTime",
                "status",
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // sort theo Patient; nếu muốn theo MedicalRecord thì sort bên dưới
    });

    // FLATTEN Patient -> MedicalRecords
    const records = [];
    for (const p of patients) {
      for (const r of p.MedicalRecords || []) {
        let orderDetails = [];
        if (typeof r.orderDetails === "string") {
          try {
            orderDetails = JSON.parse(r.orderDetails);
          } catch {
            orderDetails = [];
          }
        } else if (Array.isArray(r.orderDetails)) {
          orderDetails = r.orderDetails;
        }
        records.push({
          id: r.id,
          appointmentId: r.appointmentId,
          patientId: r.patientId,
          doctorId: r.doctorId,
          symptoms: r.symptoms,
          diagnosis: r.diagnosis,
          treatment: r.treatment,
          orderDetails,
          createdAt: r.createdAt,
          patient: {
            id: p.id,
            name: p.name,
            email: p.email,
            phoneNumber: p.phoneNumber,
          },
          doctor: r.Employee,
          appointment: r.Appointment,
        });
      }
    }

    // nếu muốn sắp theo thời điểm tạo hồ sơ:
    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách hồ sơ khám thành công",
      data: records,
    });
  } catch (error) {
    console.error("Error in searchMedicalRecord:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search medical records",
      details: error.message,
    });
  }
};

const getAllMedicalRecordByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const medicalRecords = await MedicalRecord.findAll({
      where: { appointmentId },
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email", "phoneNumber", "avatar"],
        },
        {
          model: Appointment,
          attributes: ["id", "date", "startTime", "endTime"],
        },
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
    const rec = await MedicalRecord.findByPk(req.params.id, {
      include: [
        { model: Patient, attributes: ["id", "name", "email", "phoneNumber"] },
        { model: Employee, attributes: ["id", "name", "email"] },
        {
          model: Appointment,
          attributes: ["id", "date", "startTime", "endTime"],
        },
        {
          model: Service,
          through: { attributes: ["quantity", "total"] },
        },
        {
          model: MedicalRecordMedicine,
          as: "prescribedMedicines", // tôi thêm cái này
          include: [{ model: Medicine, as: "medicine", attributes: ["id"] }],
        },
      ],
    });
    if (!rec) return res.status(404).json({ error: "Không tìm thấy hồ sơ" });
    res.json(rec);
  } catch (e) {
    res.status(500).json({ error: "Lấy hồ sơ thất bại" });
  }
};

const createMedicalRecord = async (req, res) => {
  const {
    patientId,
    doctorId,
    appointmentId,
    symptoms,
    diagnosis,
    treatment,
    services = [],
    medicines = [], // tôi thêm cái này
  } = req.body;

  const t = await sequelize.transaction();
  try {
    if (doctorId) {
      const doc = await Employee.findByPk(doctorId);
      if (!doc) return res.status(400).json({ error: 'Invalid doctorId' });
    }
    const serviceIds = services.map(s => s.serviceId);
    const serviceList = await Service.findAll({
      where: { id: serviceIds },
      raw: true,
    });

    const orderServiceDetails = svcList.map((svc) => {
      const input = services.find((i) => i.serviceId === svc.id);
      const qty = Number(input?.quantity || 1);
      return {
        serviceId: svc.id,
        name: svc.name,
        price: svc.price,
        quantity: qty,
        total: Number(svc.price) * qty,
      };
    });

    // tôi thêm cái này ↓
    const medIds = medicines.map((m) => m.medicineId);
    const medList = medIds.length
      ? await Medicine.findAll({
          where: { id: medIds },
          transaction: t,
          lock: t.LOCK.UPDATE,
        })
      : [];
    const medMap = new Map(medList.map((m) => [m.id, m]));

    const orderMedicineDetails = [];
    for (const input of medicines) {
      const m = medMap.get(input.medicineId);
      if (!m) throw new Error(`Thuốc ID ${input.medicineId} không tồn tại`);
      const qty = Number(input.quantity || 0);
      if (qty <= 0) throw new Error(`Số lượng thuốc ${m?.name} phải > 0`);
      if (m.expiryDate && new Date(m.expiryDate) < new Date()) {
        throw new Error(`Thuốc ${m.name} đã hết hạn`);
      }
      if (m.quantity < qty) {
        throw new Error(`Thuốc ${m.name} không đủ tồn kho (còn ${m.quantity})`);
      }
      await m.decrement("quantity", { by: qty, transaction: t });

      const price = Number(m.price || 0);
      orderMedicineDetails.push({
        medicineId: m.id,
        name: m.name,
        unit: m.unit,
        priceAtUse: price,
        quantity: qty,
        dose: input.dose || null,
        frequency: input.frequency || null,
        duration: input.duration || null,
        route: input.route || m.route || null,
        instructions: input.instructions || null,
        total: price * qty,
      });
    }
    // tôi thêm cái này ↑

    const record = await MedicalRecord.create(
      {
        appointmentId,
        patientId,
        doctorId,
        symptoms,
        diagnosis,
        treatment,
        orderDetails: JSON.stringify(orderServiceDetails),
      },
      { transaction: t }
    );

    if (orderServiceDetails.length) {
      await MedicalRecordService.bulkCreate(
        orderServiceDetails.map((s) => ({
          medicalRecordId: record.id,
          serviceId: s.serviceId,
          quantity: s.quantity,
          total: s.total,
        })),
        { transaction: t }
      );
    }

    // tôi thêm cái này ↓
    if (orderMedicineDetails.length) {
      await MedicalRecordMedicine.bulkCreate(
        orderMedicineDetails.map((m) => ({
          medicalRecordId: record.id,
          medicineId: m.medicineId,
          name: m.name,
          unit: m.unit,
          priceAtUse: m.priceAtUse,
          quantity: m.quantity,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          route: m.route,
          instructions: m.instructions,
          total: m.total,
        })),
        { transaction: t }
      );
    }
    // tôi thêm cái này ↑

    await t.commit();

    const totals = {
      service: orderServiceDetails.reduce(
        (s, i) => s + Number(i.total || 0),
        0
      ),
      medicine: orderMedicineDetails.reduce(
        (s, i) => s + Number(i.total || 0),
        0
      ),
    };

    res.status(201).json({
      message: "Tạo hồ sơ khám thành công",
      data: {
        id: record.id,
        symptoms,
        diagnosis,
        treatment,
        services: orderServiceDetails,
        medicines: orderMedicineDetails,
        totals: { ...totals, grand: totals.service + totals.medicine },
      },
    });
  } catch (error) {
    await t.rollback();
    res
      .status(400)
      .json({ error: error.message || "Failed to create medical record" });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { symptoms, diagnosis, treatment, services } = req.body;
    const record = await MedicalRecord.findByPk(id);
    if (!record)
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

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

const listMedicalRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { rows, count } = await MedicalRecord.findAndCountAll({
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Patient, attributes: ["id", "name"] },
        { model: Employee, attributes: ["id", "name"] },
      ],
    });

    res.json({
      records: rows,
      total: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
    });
  } catch (e) {
    res.status(500).json({ error: "Lấy danh sách hồ sơ thất bại" });
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

    console.log("Getting medical records for doctorId:", doctorId, "patientId:", patientId);
    if (req.userId && req.userId !== parseInt(doctorId)) {
      return res.status(403).json({
        success: false,
        error: "Bạn chỉ có thể xem hồ sơ của bệnh nhân mà bạn đã khám",
      });
    }

    const whereConditions = { doctorId: parseInt(doctorId) };
    if (patientId) {
      whereConditions.patientId = parseInt(patientId);
    }

    console.log("Where conditions:", whereConditions);

    const medicalRecords = await MedicalRecord.findAll({
      where: whereConditions,
      include: [
        {
          model: Patient,
          attributes: [
            "id",
            "name",
            "email",
            "phoneNumber",
            "dateOfBirth",
            "gender",
          ],
        },
        {
          model: Appointment,
          attributes: ["id", "date", "startTime", "endTime", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("Found medical records:", medicalRecords.length);

    const formattedRecords = medicalRecords.map((record) => ({
      id: record.id,
      appointmentId: record.appointmentId,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      orderDetails:
        typeof record.orderDetails === "string"
          ? JSON.parse(record.orderDetails)
          : record.orderDetails || [],
      createdAt: record.createdAt,
      patient: record.Patient,
      appointment: record.Appointment,
    }));

    res.status(200).json({
      success: true,
      message: "Lấy danh sách hồ sơ khám thành công",
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Error in getMedicalRecordsByDoctor:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get medical records",
      details: error.message,
    });
  }
};

const getPatientsByDoctorV = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    let dateCondition = {};
    if (startDate && endDate) {
      dateCondition = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      dateCondition = { [Op.gte]: startDate };
    } else if (endDate) {
      dateCondition = { [Op.lte]: endDate };
    }

    const appointments = await Appointment.findAll({
      where: {
        doctorId: parseInt(doctorId),
        status: { [Op.in]: ['confirmed', 'completed'] },
        ...(startDate || endDate ? { date: dateCondition } : {})
      },
      attributes: ["patientId"],
      group: ["patientId"],
      raw: true,
    });

    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Chưa có bệnh nhân nào",
        data: [],
      });
    }

    const patientIds = appointments.map(a => a.patientId);

    const patients = await Patient.findAll({
      where: { id: { [Op.in]: patientIds } },
      attributes: ['id', 'name', 'email', 'phoneNumber', 'dateOfBirth', 'gender']
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bệnh nhân thành công",
      data: patients,
    });
  } catch (error) {
    console.error("Error in getPatientsByDoctorV:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get patients",
      details: error.message,
    });
  }
};




const getPatientsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    console.log("Getting patients for doctorId:", doctorId);
    if (req.userId && req.userId !== parseInt(doctorId)) {
      return res.status(403).json({
        success: false,
        error: "Bạn chỉ có thể xem danh sách bệnh nhân của mình",
      });
    }
    const appointments = await Appointment.findAll({
      where: {
        doctorId: parseInt(doctorId),
        status: { [Op.in]: ["confirmed", "pending"] },
        date: {
          [Op.gte]: new Date().toISOString().split("T")[0],
        },
      },
      include: [
        {
          model: Patient,
          attributes: [
            "id",
            "name",
            "email",
            "phoneNumber",
            "dateOfBirth",
            "gender",
          ],
          required: true,
        },
      ],
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    console.log("Found appointments:", appointments.length);

    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Chưa có lịch hẹn nào",
        data: [],
      });
    }
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
        patientIdentityNumber: apt.Patient.identityNumber || '',
        patientPhone: apt.Patient.phoneNumber || '',
        patientDOB: apt.Patient.dateOfBirth || '',
        patientGender: apt.Patient.gender || ''
      };
    }).filter(item => item !== null); 

    console.log("Formatted patients:", patientsWithAppointments);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách bệnh nhân thành công",
      data: patientsWithAppointments,
    });
  } catch (error) {
    console.error("Error in getPatientsByDoctor:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get patients",
      details: error.message,
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
  getAllMedicalRecordsByPatient,
  searchMedicalRecord,
};
