const { PayOS } = require("@payos/node");
require("dotenv").config();

const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const MedicalRecord = require("../models/MedicalRecord");
const MedicalRecordService = require("../models/MedicalRecordService");
const MedicalRecordMedicine = require("../models/MedicalRecordMedicine");

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

const createPayment = async (req, res) => {
  try {
    const { appointmentId, patientId, returnUrl, cancelUrl } = req.body;

    if (!appointmentId || !patientId) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment)
      return res.status(404).json({ error: "Không tìm thấy cuộc hẹn" });

    const patient = await Patient.findByPk(patientId);
    if (!patient)
      return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });

    const medicalRecord = await MedicalRecord.findOne({
      where: { appointmentId },
    });
    if (!medicalRecord)
      return res.status(404).json({ error: "Không tìm thấy hồ sơ y tế" });

    const services = await MedicalRecordService.findAll({
      where: { medicalRecordId: medicalRecord.id },
      attributes: ["total"],
      raw: true,
    });
    const serviceAmount = services.reduce(
      (sum, s) => sum + Number(s.total || 0),
      0
    );

    const medicines = await MedicalRecordMedicine.findAll({
      where: { medicalRecordId: medicalRecord.id },
      attributes: ["total"],
      raw: true,
    });
    const medicineAmount = medicines.reduce(
      (sum, m) => sum + Number(m.total || 0),
      0
    );

    const totalAmount = Math.round(serviceAmount + medicineAmount);

    if (totalAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Không có dịch vụ/thuốc hoặc tổng tiền bằng 0" });
    }

    const orderCode = Math.floor(Date.now() / 1000);

    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: totalAmount,
      description: `Thanh toán khám bệnh #${appointmentId}`,
      returnUrl: returnUrl || `${process.env.FRONT_END_URL}/payments/success`,
      cancelUrl:
        cancelUrl ||
        `${process.env.FRONT_END_URL}/payments/cancel?appointmentId=${appointmentId}`,
    });

    const payment = await Payment.create({
      appointmentId,
      patientId,
      orderCode,
      amount: totalAmount,
      method: "payos",
      status: "pending",
      transactionId: paymentLink.paymentLinkId || null,
    });

    res.status(201).json({
      message: "Tạo thanh toán thành công",
      checkoutUrl: paymentLink.checkoutUrl,
      serviceAmount,
      medicineAmount,
      totalAmount,
      payment,
    });
  } catch (error) {
    console.error("createPayment error:", error);
    res.status(500).json({
      error: "Lỗi tạo thanh toán PayOS",
      detail: error.message,
    });
  }
};

const payosWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log("Webhook received:", JSON.stringify(webhookData, null, 2));

    const verifiedData = await payos.webhooks.verify(webhookData);
    console.log("Webhook verified:", verifiedData);

    const {
      orderCode,
      paymentLinkId,
      amount,
      reference,
      transactionDateTime,
      code,
      desc,
    } = verifiedData;

    if (code !== "00") {
      console.log("Payment failed:", { code, desc });
      return res.status(200).json({
        error: 0,
        message: "Payment failed",
      });
    }

    console.log("Processing payment:", { orderCode, paymentLinkId });

    const payment = await Payment.findOne({
      where: { transactionId: paymentLinkId },
    });

    if (!payment) {
      console.log("Payment not found for paymentLinkId:", paymentLinkId);

      const paymentByOrderCode = await Payment.findOne({
        where: { orderCode: orderCode },
      });

      if (paymentByOrderCode) {
        await paymentByOrderCode.update({
          transactionId: paymentLinkId,
          status: "paid",
          reference: reference,
          transactionDateTime: transactionDateTime,
        });

        await Appointment.update(
          { status: "completed" },
          { where: { id: paymentByOrderCode.appointmentId } }
        );

        console.log(
          `Updated payment ${paymentByOrderCode.id} and appointment to completed`
        );

        return res.status(200).json({
          error: 0,
          message: "Success",
        });
      }

      return res.status(200).json({
        error: 0,
        message: "Payment not found",
      });
    }

    if (payment.status === "paid") {
      console.log("Already processed");
      return res.status(200).json({
        error: 0,
        message: "Already processed",
      });
    }

    await payment.update({
      status: "paid",
      reference: reference,
      transactionDateTime: transactionDateTime,
    });

    await Appointment.update(
      { status: "completed" },
      { where: { id: payment.appointmentId } }
    );

    console.log(
      `Payment ${payment.id} marked as paid, Appointment marked as completed!`
    );

    return res.status(200).json({
      error: 0,
      message: "Success",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(200).json({
      error: -1,
      message: "Error",
      details: error.message,
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: "Thiếu appointmentId" });
    }

    const payment = await Payment.findOne({ where: { appointmentId } });

    if (!payment) {
      return res.status(404).json({ error: "Không tìm thấy giao dịch để xoá" });
    }

    await payment.destroy();

    console.log(`🗑️ Đã xoá payment có appointmentId = ${appointmentId}`);
    return res.status(200).json({ message: "Đã xoá giao dịch bị huỷ" });
  } catch (error) {
    console.error("❌ Lỗi xoá payment:", error);
    return res.status(500).json({ error: "Lỗi xoá payment" });
  }
};

module.exports = { createPayment, payosWebhook, deletePayment };
