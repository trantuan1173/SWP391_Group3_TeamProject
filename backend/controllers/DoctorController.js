const { Doctor, Appointment, DoctorSchedule, Employee, EmployeeRole, Role } = require("../models");
const { Op } = require("sequelize");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");

const getDoctor = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: ["id", "speciality", "isAvailable", "employeeId"], // Lấy speciality từ Doctor
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email", "phoneNumber", "avatar"],
          required: true, // INNER JOIN - chỉ lấy Doctor có Employee
          include: [
            {
              model: EmployeeRole,
              as: 'EmployeeRoles',
              attributes: [], // Không cần lấy data, chỉ dùng để filter
              where: {
                roleId: 2 // Chỉ lấy Employee có roleId = 2 (Bác sĩ)
              },
              required: true // INNER JOIN
            }
          ]
        }
      ],
    });

    // Format lại data để dễ sử dụng ở frontend
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      speciality: doctor.speciality || "Chưa có chuyên khoa",
      isAvailable: doctor.isAvailable,
      employee: {
        id: doctor.Employee?.id,
        name: doctor.Employee?.name || "Chưa có tên",
        email: doctor.Employee?.email,
        phoneNumber: doctor.Employee?.phoneNumber,
        avatar: doctor.Employee?.avatar 
          ? `${req.protocol}://${req.get('host')}${doctor.Employee.avatar}`
          : "https://randomuser.me/api/portraits/men/32.jpg"
      }
    }));

    res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error("Error in getDoctor:", error);
    res.status(500).json({ error: "Failed to get doctor", details: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      attributes: ["id", "speciality", "isAvailable", "employeeId"],
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email", "phoneNumber", "avatar"],
        }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get doctor" });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update doctor" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.destroy({ where: { id: req.params.id } });
    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
};

const getDoctorAvailable = async (req, res) => {
  try {
    const { speciality, date, startTime, endTime } = req.body;

    const doctors = await Doctor.findAll({
      where: { isAvailable: true, speciality },
      attributes: ["id", "speciality", "isAvailable", "employeeId"],
      include: [
        {
          model: Employee,
          attributes: ["id", "name", "email", "phoneNumber", "avatar"],
        }
      ]
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
    const specialties = await Doctor.findAll({
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