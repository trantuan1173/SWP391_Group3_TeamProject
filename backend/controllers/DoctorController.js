const { Appointment, DoctorSchedule, Employee, EmployeeRole, Role } = require("../models");
const { Op } = require("sequelize");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");

const getDoctor = async (req, res) => {
  try {
    // Find employees who have the 'doctor' role (roleId = 2)
    const doctors = await Employee.findAll({
      attributes: ["id", "name", "email", "phoneNumber", "avatar", "speciality", "isActive"],
      include: [
        {
          model: EmployeeRole,
          as: 'employeeRoles',
          attributes: [],
          where: { roleId: 2 },
          required: true,
        }
      ],
    });

    // Format response for frontend
    const formattedDoctors = doctors.map((d) => ({
      id: d.id,
      name: d.name || 'Chưa có tên',
      email: d.email,
      phoneNumber: d.phoneNumber,
      avatar: d.avatar ? `${req.protocol}://${req.get('host')}${d.avatar}` : null,
      speciality: d.speciality || 'Chưa có chuyên khoa',
      isActive: d.isActive,
    }));

    return res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error("Error in getDoctor:", error);
    res.status(500).json({ error: "Failed to get doctor", details: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const d = await Employee.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "phoneNumber", "avatar", "speciality", "isActive"]
    });
    if (!d) return res.status(404).json({ error: "Doctor not found" });

    const formatted = {
      id: d.id,
      name: d.name || 'Chưa có tên',
      email: d.email,
      phoneNumber: d.phoneNumber,
      avatar: d.avatar ? `${req.protocol}://${req.get('host')}${d.avatar}` : null,
      speciality: d.speciality || 'Chưa có chuyên khoa',
      isActive: d.isActive,
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor" });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Employee.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update doctor" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Employee.destroy({ where: { id: req.params.id } });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
};

const getDoctorAvailable = async (req, res) => {
  try {
    const { speciality, date, startTime, endTime } = req.body;

    const doctors = await Employee.findAll({
      where: { isActive: true, speciality },
      attributes: ["id", "speciality", "isActive" , "name", "email", "phoneNumber", "avatar"],
    });
    const doctorIds = doctors.map(d => d.id);

    if (doctorIds.length === 0) {
      return res.status(200).json([]);
    }

    const validSchedules = await DoctorSchedule.findAll({
      where: {
        doctorId: { [Op.in]: doctorIds },
        date,
        startTime: { [Op.lte]: startTime },
        endTime:   { [Op.gte]: endTime }
      }
    });
    const validDoctorIds = validSchedules.map(s => s.doctorId);

    const busyAppointments = await Appointment.findAll({
      where: {
        doctorId: { [Op.in]: validDoctorIds },
        date,
        status: "confirmed",
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime:   { [Op.gt]: startTime } }
        ]
      }
    });
    const busyDoctorIds = new Set(busyAppointments.map(a => a.doctorId));

    const availableDoctors = doctors.filter(d => validDoctorIds.includes(d.id) && !busyDoctorIds.has(d.id));

    res.status(200).json(availableDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor" });
  }
};

const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const schedules = await DoctorSchedule.findAll({
      where: {
        doctorId: doctorId
      },
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor schedule" });
  }
};

const { Sequelize } = require("sequelize");
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Employee.findAll({
      attributes: [
        'speciality',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'doctorCount']
      ],
      where: {
        speciality: {
          [Op.ne]: null // Loại bỏ các giá trị null
        }
      },
      group: ['speciality'],
      raw: true
    });

    // Format lại data
    const formattedSpecialties = specialties.map(s => ({
      name: s.speciality,
      doctorCount: parseInt(s.doctorCount) || 0
    }));

    res.status(200).json(formattedSpecialties);
  } catch (error) {
    console.error("Error in getSpecialties:", error);
    res.status(500).json({ error: "Failed to get specialties", details: error.message });
  }
};

module.exports = { getDoctor, getDoctorById, updateDoctor, deleteDoctor, getDoctorAvailable, getDoctorSchedule, getSpecialties };
