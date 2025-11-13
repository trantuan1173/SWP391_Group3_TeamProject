const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware.js");
const {
  createTicket,
  getTicketById,
  listTickets,
  updateTicketStatus,
  answerTicket,
  deleteTicket,
  listTicketsAdmin,
} = require("../controllers/TicketController");

router.post("/create", protect, createTicket);
router.get("/", protect, listTickets);
router.get("/get-ticket/:id", protect, getTicketById);
router.patch(
  "/:id/status",
  protect,
  authorize("receptionist", "admin"),
  updateTicketStatus
);
router.post(
  "/:id/answer",
  protect,
  authorize("receptionist", "admin"),
  answerTicket
);
router.delete("/delete/:id", protect, deleteTicket);
router.get(
  "/receptionist/list-tickets",
  protect,
  authorize("receptionist", "admin"),
  listTicketsAdmin
);
module.exports = router;
