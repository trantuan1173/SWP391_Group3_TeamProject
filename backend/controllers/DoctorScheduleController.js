const { DoctorSchedule, Appointment, Employee, Room, Patient  } = require("../models");
const { Op } = require("sequelize");

const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.findAll({
      where: {
        doctorId: doctorId,
        status: ['confirmed', 'to-payment', 'completed']

      },
      attributes: ["id", "doctorId", "date", "startTime", "endTime", "patientId", "status"],
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ],
      include: [
        {
          model: Patient,
          attributes: ["name", "identityNumber"]
        },
        {
          model: Room,
          attributes: ["id","name"]
        }
      ]
    });

    const formattedAppointments = appointments.map(apt => {
      const json = apt.toJSON();
      return {
        id: json.id,
        doctorId: json.doctorId,
        status: json.status,
        date: json.date,
        startTime: json.startTime?.slice(0, 5),
        endTime: json.endTime?.slice(0, 5),
        patient: json.Patient ? {
          name: json.Patient.name,
          identityNumber: json.Patient.identityNumber
        } : null,
        room: json.Room ? {
          id: json.Room.id,
          name: json.Room.name
        } : null
      };
    });

    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error("Error in getDoctorSchedule:", error);
    console.log("Patient data:", appointments.map(a => a.Patient));
    res
      .status(500)
      .json({ error: "Failed to get doctor schedule", details: error.message });
  }
};

const createDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, roomId } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingSchedule = await DoctorSchedule.findOne({
      where: {
        doctorId,
        date,
        [Op.or]: [
          {
            startTime: { [Op.between]: [startTime, endTime] },
          },
          {
            endTime: { [Op.between]: [startTime, endTime] },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } },
            ],
          },
        ],
      },
    });

    if (existingSchedule) {
      return res.status(400).json({ error: "Schedule conflict detected" });
    }

    const schedule = await DoctorSchedule.create({
      doctorId,
      date,
      startTime,
      endTime,
      roomId,
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error("Error in createDoctorSchedule:", error);
    res
      .status(500)
      .json({ error: "Failed to create schedule", details: error.message });
  }
};

const updateDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, roomId } = req.body;

    const schedule = await DoctorSchedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const existingSchedule = await DoctorSchedule.findOne({
      where: {
        id: { [Op.ne]: id },
        doctorId: schedule.doctorId,
        date: date || schedule.date,
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [
                startTime || schedule.startTime,
                endTime || schedule.endTime,
              ],
            },
          },
          {
            endTime: {
              [Op.between]: [
                startTime || schedule.startTime,
                endTime || schedule.endTime,
              ],
            },
          },
        ],
      },
    });

    if (existingSchedule) {
      return res.status(400).json({ error: "Schedule conflict detected" });
    }

    await schedule.update({
      date: date || schedule.date,
      startTime: startTime || schedule.startTime,
      endTime: endTime || schedule.endTime,
      roomId: roomId !== undefined ? roomId : schedule.roomId,
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error in updateDoctorSchedule:", error);
    res
      .status(500)
      .json({ error: "Failed to update schedule", details: error.message });
  }
};

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
    res
      .status(500)
      .json({ error: "Failed to delete schedule", details: error.message });
  }
};

module.exports = {
  getDoctorSchedule,
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
