const { Employee, Role, EmployeeRole} = require("../models");
const jwt = require("jsonwebtoken");
const { sendVerifyEmail } = require("../service/sendVerifyEmail");

// Generate JWT token
function generateToken(id, type) {
  return jwt.sign({ id: id, type: type }, process.env.JWT_SECRET || "your_jwt_secret", {
    expiresIn: "2h",
  });
}


// Lấy thông tin employee kèm role
const getEmployeeWithRole = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Role,
          as: "roles", 
          through: { attributes: [] }, 
          attributes: ["id", "name"]
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ error: "Không tìm thấy role" });
    }

    // Lấy danh sách roles
    const roles = employee.roles.map(role => ({
      id: role.id,
      name: role.name
    }));

    res.json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      address: employee.address,
      roles,
      isDoctor: roles.some(role => role.name.toLowerCase() === "doctor") // Check nếu có role Doctor
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Lỗi server", details: error.message });
  }
};


//Employee login (Log)
const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({
      where: { email },
      include: [{ model: Role, as: "roles", through: { attributes: [] }, attributes: ["id", "name"] }]
    });
    if (!employee.isActive) {
      return res.status(401).json({ error: "User not verified" });
    }
    if (!employee) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!await employee.comparePassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.status(200).json({ employee, token: generateToken(employee.id, "employee") });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
};


const authProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findByPk(decodedToken.id, {
      include: [
        {
          model: Role,
          as: "roles", 
          through: { attributes: [] }, 
          attributes: ["id", "name"]
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

module.exports = { employeeLogin, getEmployeeWithRole, authProfile };
