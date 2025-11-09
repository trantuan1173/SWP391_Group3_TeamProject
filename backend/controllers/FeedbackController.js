const { Feedback, Appointment, Patient  } = require('../models');

// Create feedback for an appointment. Only the patient who owns the appointment may submit.
async function createFeedback(req, res) {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const { content, rating } = req.body;

    if (!content || typeof rating === 'undefined') {
      return res.status(400).json({ error: 'Content and rating are required' });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Only patient owner can create feedback
    if (req.userType !== 'patient' || req.userId !== appointment.patientId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Prevent duplicate feedback for same appointment
    const existing = await Feedback.findOne({ where: { appointmentId } });
    if (existing) return res.status(409).json({ error: 'Feedback already submitted for this appointment' });

    const fb = await Feedback.create({ appointmentId, patientId: req.userId, content, rating });
    res.status(201).json({ message: 'Feedback created', feedback: fb });
  } catch (err) {
    console.error('[createFeedback] error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
}

async function getFeedbackForAppointment(req, res) {
  try {
    const appointmentId = parseInt(req.params.id, 10);
    const fb = await Feedback.findOne({ where: { appointmentId } });
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });
    res.json(fb);
  } catch (err) {
    console.error('[getFeedbackForAppointment] error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

async function getFeedbackForDoctor(req, res) {
  try {
    const doctorId = parseInt(req.params.id, 10);
    console.log("[getFeedbackForDoctor] doctorId nhận được:", doctorId);
    // Lấy tất cả các lịch hẹn của bác sĩ
    const appointments = await Appointment.findAll({
      where: { doctorId },
      attributes: ['id'],
    });

    const appointmentIds = appointments.map(a => a.id);
    console.log("[getFeedbackForDoctor] appointmentIds:", appointmentIds);
    // Nếu không có lịch hẹn thì trả về rỗng
    if (appointmentIds.length === 0) {
      return res.json({ data: [] });
    }

    // Lấy tất cả feedback theo appointmentId
    const feedbacks = await Feedback.findAll({
      where: { appointmentId: appointmentIds },
      include: [
        {
          model: Patient,
          attributes: ['name', 'id'],
        }
      ]
    });
    console.log("[getFeedbackForDoctor] feedbacks:", feedbacks);
    res.json({ data: feedbacks });
  } catch (err) {
    console.error('[getFeedbackForDoctor] error:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks for doctor' });
  }
}


module.exports = { createFeedback, getFeedbackForAppointment, getFeedbackForDoctor };
