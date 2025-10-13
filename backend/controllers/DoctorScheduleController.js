const { DoctorSchedule, Employee, Room } = require("../models");
const { Op } = require("sequelize");

// Lấy lịch làm việc của bác sĩ
const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const schedules = await DoctorSchedule.findAll({
      where: {
        doctorId: doctorId
      },
      include: [
        {
          model: Room,
          attributes: ['id', 'name']
        }
      ],
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error in getDoctorSchedule:", error);
    res.status(500).json({ error: "Failed to get doctor schedule", details: error.message });
  }
};

// Tạo lịch làm việc mới
const createDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, roomId } = req.body;

    // Validate input
    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Kiểm tra trùng lịch
    const existingSchedule = await DoctorSchedule.findOne({
      where: {
        doctorId,
        date,
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime, endTime] }
          },
          {
            endTime: { [Op.between]: [startTime, endTime] }
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } }
            ]
          }
        ]
      }
    });

    if (existingSchedule) {
      return res.status(400).json({ error: "Schedule conflict detected" });
    }

    const schedule = await DoctorSchedule.create({
      doctorId,
      date,
      startTime,
      endTime,
      roomId
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error in createDoctorSchedule:", error);
    res.status(500).json({ error: "Failed to create schedule", details: error.message });
  }
};

// Cập nhật lịch làm việc
const updateDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, roomId } = req.body;

    const schedule = await DoctorSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Kiểm tra trùng lịch (trừ lịch hiện tại)
    const existingSchedule = await DoctorSchedule.findOne({
      where: {
        id: { [Op.ne]: id },
        doctorId: schedule.doctorId,
        date: date || schedule.date,
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime || schedule.startTime, endTime || schedule.endTime] }
          },
          {
            endTime: { [Op.between]: [startTime || schedule.startTime, endTime || schedule.endTime] }
          }
        ]
      }
    });

    if (existingSchedule) {
      return res.status(400).json({ error: "Schedule conflict detected" });
    }

    await schedule.update({
      date: date || schedule.date,
      startTime: startTime || schedule.startTime,
      endTime: endTime || schedule.endTime,
      roomId: roomId !== undefined ? roomId : schedule.roomId
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error in updateDoctorSchedule:", error);
    res.status(500).json({ error: "Failed to update schedule", details: error.message });
  }
};

// Xóa lịch làm việc
const deleteDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await DoctorSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    await schedule.destroy();
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDoctorSchedule:", error);
    res.status(500).json({ error: "Failed to delete schedule", details: error.message });
  }
};

module.exports = {
  getDoctorSchedule,
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule
};
