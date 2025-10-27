const { Appointment, Room, Employee, Patient,MedicalRecord,sequelize } = require("../models");
const {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
} = require("../service/sendVerifyEmail");
const { Op } = require("sequelize");
const dayjs = require('dayjs'); 
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const checkDoctorAvailability = async (doctorId, date, startTime, endTime) => {
    try {

        const dateOnly = dayjs(date).format('YYYY-MM-DD'); 
        
        const occupiedAppointments = await Appointment.findAll({
            where: {
                doctorId: doctorId,
                date: dateOnly,
                status: { [Op.ne]: 'cancelled' }, 
                [Op.or]: [
                    {
                        startTime: { [Op.lt]: endTime },
                        endTime: { [Op.gt]: startTime }
                    }
                ]
            },
            attributes: ['id'] 
        });

        return occupiedAppointments.length === 0;

    } catch (error) {
        console.error("Error checking doctor availability:", error);
        return false; 
    }
};


const getAvailableDoctors = async (req, res) => {
    const { date, startTime, endTime, speciality } = req.query; 

    if (!date || !startTime || !endTime) {
        return res.status(400).json({ error: "Date, startTime, and endTime are required." });
    }

    const SLOT_DURATION_MINUTES = 60; 

    const requestedSlotStart = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm:ss');
    
    const MAX_DAYS_AHEAD = 3;
    const maxSearchDate = requestedSlotStart.add(MAX_DAYS_AHEAD, 'day').endOf('day');

    const START_HOUR = 7; 
    const END_HOUR = 20;

    try {
        const doctorWhereClause = {};
        if (speciality && speciality.trim() !== "") {
            doctorWhereClause.speciality = speciality.trim();
        }
        const allDoctors = await Employee.findAll({
            where: doctorWhereClause,
            attributes: ['id', 'name', 'speciality', 'email', 'phoneNumber']
        });

        if (allDoctors.length === 0) {
             return res.status(200).json({ availableDoctors: [], suggestedSlots: [] });
        }

        const initiallyAvailableDoctors = [];
        for (const doctor of allDoctors) {
            const isAvailable = await checkDoctorAvailability(doctor.id, date, startTime, endTime);
            if (isAvailable) {
                initiallyAvailableDoctors.push(doctor);
            }
        }

        if (initiallyAvailableDoctors.length > 0) {
            return res.status(200).json({
                availableDoctors: initiallyAvailableDoctors,
                suggestedSlots: []
            });
        }
        
        const suggestedSlots = [];
        let currentSearchTime = requestedSlotStart; 
        
        const MAX_SUGGESTIONS = 5; 

        while (suggestedSlots.length < MAX_SUGGESTIONS && currentSearchTime.isBefore(maxSearchDate)) {
            
            currentSearchTime = currentSearchTime.add(SLOT_DURATION_MINUTES, 'minute'); 
            let suggestionStartTime = currentSearchTime;
            
            if (suggestionStartTime.hour() >= END_HOUR) { 
                suggestionStartTime = suggestionStartTime.add(1, 'day').hour(START_HOUR).minute(0).second(0);
            } 
            
            if (suggestionStartTime.hour() < START_HOUR) {
                suggestionStartTime = suggestionStartTime.hour(START_HOUR).minute(0).second(0);
            }

            currentSearchTime = suggestionStartTime;

            const suggestionEndTime = suggestionStartTime.add(SLOT_DURATION_MINUTES, 'minute');

            if (suggestionEndTime.hour() <= END_HOUR && suggestionStartTime.hour() >= START_HOUR) {
                
                let isSlotAvailable = false;
                let availableDoctorNames = [];

                const checkDate = suggestionStartTime.format('YYYY-MM-DD');
                const checkStartTime = suggestionStartTime.format('HH:mm:ss');
                const checkEndTime = suggestionEndTime.format('HH:mm:ss');

                for (const doctor of allDoctors) {
                    const isAvailable = await checkDoctorAvailability(
                        doctor.id, 
                        checkDate,
                        checkStartTime, 
                        checkEndTime
                    );
                    
                    if (isAvailable) {
                        isSlotAvailable = true;
                        availableDoctorNames.push(doctor.name);
                    }
                }

                if (isSlotAvailable) {
                    suggestedSlots.push({
                        date: suggestionStartTime.format('DD/MM/YYYY'),
                        startTime: suggestionStartTime.format('HH:mm'),
                        endTime: suggestionEndTime.format('HH:mm'),
                        availableDoctorsCount: availableDoctorNames.length
                    });
                }
            } else if (suggestionEndTime.hour() > END_HOUR) {
                 currentSearchTime = suggestionStartTime.add(1, 'day').hour(START_HOUR).minute(0).second(0);
            }
        }
        
        return res.status(200).json({
            availableDoctors: [],
            suggestedSlots: suggestedSlots
        });

    } catch (error) {
        console.error("Failed to get available doctors:", error);
        res.status(500).json({ error: "Failed to get available doctors" });
    }
};

// Get available rooms for a specific time slot
const getAvailableRooms = async (req, res) => {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
        return res.status(400).json({ error: "Date, startTime, and endTime are required." });
    }

    try {
        const allAvailableRooms = await Room.findAll({
            where: {
                status: 'available'
            },
            attributes: ['id', 'name', 'type']
        });

        const occupiedAppointments = await Appointment.findAll({
            where: {
                date: date,
                status: { [Op.ne]: 'cancelled' }, 
                [Op.or]: [
                    {
                        startTime: { [Op.lt]: endTime },
                        endTime: { [Op.gt]: startTime }
                    }
                ]
            },
            attributes: ['roomId']
        });
        
        const occupiedRoomIds = occupiedAppointments.map(a => a.roomId).filter(id => id !== null);
        
        const availableRooms = allAvailableRooms.filter(room => !occupiedRoomIds.includes(room.id));

        res.status(200).json(availableRooms);
    } catch (error) {
        console.error("Failed to get available rooms:", error);
        res.status(500).json({ error: "Failed to get available rooms" });
    }
};

//Get all appointment
const getAppointment = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const limit = req.query.limit || 8;
    const status = req.query.status || "all";
    // const searchPhone = req.query.searchPhone || "";
    // const patientName = req.query.patientName || "";
    const whereClause = {};

    if (status !== "all") {
      whereClause.status = status;
    }
    if (search !== "") {
      whereClause[Op.or] = [
        { "$Patient.phoneNumber$": { [Op.like]: `%${search}%` } },
        { "$Patient.name$": { [Op.like]: `%${search}%` } },
      ];
    }
    const staff = await Appointment.findAndCountAll({
      include: [
        { model: Patient },
        { model: Employee },
        { model: Room, attributes: ["name", "type"] },
      ],
      where: whereClause,
      offset: (page - 1) * limit,
      limit: +limit,
      order: [["date", "DESC"]]
    });
    res.status(200).json({ data: staff.rows, totalPages: Math.ceil(staff.count / limit), totalItems: staff.count });
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
        { model: Employee },
        { model: Room, attributes: ["id", "name", "type"] },
        { model: Patient },
        {model: MedicalRecord}
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
  const searchPhone = req.query.searchPhone || "";
  const patientName = req.query.patientName || "";
  const page = req.query.page || 1;
  const limit = req.query.limit || 8;
  const search = req.query.search || "";
  const status = req.query.status || "all";
  try {
    const whereClause = {};

    if (status !== "all") {
      whereClause.status = status;
    }
    whereClause.date = {
      [Op.gte]: new Date(),
    };
    if (search !== "") {
      whereClause[Op.or] = [
        { "$Patient.phoneNumber$": { [Op.like]: `%${search}%` } },
        { "$Patient.name$": { [Op.like]: `%${search}%` } },
      ];
    }
    const staff = await Appointment.findAndCountAll({
      include: [
        { model: Patient },
        { model: Employee },
        { model: Room, attributes: ["name", "type"] },
      ],
      where: whereClause,
      offset: (page - 1) * limit,
      limit: +limit,
    });
    res.status(200).json({ data: staff.rows, totalPages: Math.ceil(staff.count / limit), totalItems: staff.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
};

//Receptionist Dashboard info
const getAppointmentDashboard = async (req, res) => {
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

//Get appointment by patient id
const getAppointmentByPatientId = async (req, res) => {
  try {
    const appointment = await Appointment.findAll({
      where: { patientId: req.params.id },
      include: [
        // doctor is stored as employee via doctorId foreign key
        { model: Employee, attributes: ["name", "email", "phoneNumber", "avatar"] },
        { model: Room, attributes: ["name", "type"] },
      ],
    });

    res.status(200).json(appointment);
  } catch (error) {
    console.error('[getAppointmentByPatientId] error:', error && error.stack ? error.stack : error);
    // Temporary fallback: return empty array so frontend remains usable while DB connectivity is fixed
    res.status(200).json([]);
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

module.exports = { 
  getAppointment, 
  getAppointmentById, 
  updateAppointment, 
  deleteAppointment, 
  getAppointmentByPatientId, 
  getAppointmentByDoctorId, 
  getAppointmentByStatus, 
  getAppointmentToday, 
  getAppointmentDashboard,
  getAvailableDoctors,
  getAvailableRooms
 };