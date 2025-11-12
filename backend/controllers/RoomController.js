const { Room } = require("../models");

// GET /api/employees/rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      attributes: ["id", "name", "type"],
      order: [["name", "ASC"]],
    });
    res.json({ data: rooms });
  } catch (error) {
    console.error("Fetch rooms error:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

module.exports = { getAllRooms };
