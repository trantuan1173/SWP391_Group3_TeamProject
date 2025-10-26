const { Appointment, Room, Employee, Patient } = require("../models");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");
const { Op, sequelize } = require("sequelize");
//Get all appointment
const getAppointment = async (req, res) => {
  try {
    const staff = await Appointment.findAll({
        include: [
            {
                model: Patient,
            },
            {
                model: Employee,
            },
            { model: Room, attributes: ["name", "type"] },
        ],
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get staff" });
  }
};

//Get appointment by id
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Room, attributes: ["id", "name", "type"] },
      ],
    });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

//Get all appointmenr today
const getAppointmentToday = async (req, res) => {
  try {
    const staff = await Appointment.findAll({
        include: [
            {
                model: Patient,
            },
            {
                model: Employee,
            },
            { model: Room, attributes: ["name", "type"] },
        ],
        where: {
          status: ["pending", "confirmed", "to-payment", "completed"],
            date: {
                [Op.gte]: new Date(),
            },
        },
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
};

//Update appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    await appointment.update(req.body);
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update staff" });
  }
};

//Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.destroy({ where: { id: req.params.id } });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete staff" });
  }
};

//Get appointment by patient id with filtering, search and pagination
const getAppointmentByPatientId = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id, 10);

    // Enforce at controller level that a patient can only fetch their own appointments
    if (req.userType === 'patient' && req.userId !== patientId) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ được xem lịch khám của chính mình' });
    }

    // Query params for filtering and pagination
    const {
      page = 1,
      limit = 20,
      status,
      from,
      to,
      doctorId,
      search,
    } = req.query;

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
    const offset = (pg - 1) * lim;

    const where = { patientId };

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = parseInt(doctorId, 10);
    }

    if (from || to) {
      where.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) where.date[Op.gte] = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) where.date[Op.lte] = toDate;
      }
    }

    // Build search across related models (employee name and room name)
    const include = [
      { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
      { model: Room, attributes: ["id", "name", "type"] },
    ];

    // If search provided, use $Model.field$ syntax in where with OR
    const finalWhere = { ...where };
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const like = { [Op.like]: `%${search.trim()}%` };
      finalWhere[Op.or] = [
        { '$Employee.name$': like },
        { '$Room.name$': like },
      ];
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where: finalWhere,
      include,
      order: [['date', 'DESC'], ['startTime', 'ASC']],
      limit: lim,
      offset,
      distinct: true,
    });

    const pages = Math.ceil(count / lim) || 1;

    res.status(200).json({ data: rows, total: count, page: pg, pages });
  } catch (error) {
    console.error('[getAppointmentByPatientId] error:', error && error.stack ? error.stack : error);
    res.status(500).json({ success: false, message: 'Failed to get appointments' });
  }
};

//Get appointment by doctor id
const getAppointmentByDoctorId = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({
      where: { doctorId: req.params.id },
      include: [
        { model: Employee, attributes: ["id", "name", "email", "phoneNumber", "avatar"] },
        { model: Room, attributes: ["id", "name", "type"] },
      ],
    });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

//Get appointment by status
const getAppointmentByStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({ where: { status: req.params.status } });
    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

module.exports = { getAppointment, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentByPatientId, getAppointmentByDoctorId, getAppointmentByStatus, getAppointmentToday };