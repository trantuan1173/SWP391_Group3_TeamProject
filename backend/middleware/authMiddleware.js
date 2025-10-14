const jwt = require("jsonwebtoken");
const { Employee, Patient, Role } = require("../models");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    let user = null;

    if (decoded.type === "employee") {
      // Lấy employee + roles
      user = await Employee.findByPk(decoded.id, {
        include: {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      });

      if (user) {
        user = user.toJSON();
        user.roleNames = user.roles.map(r => r.name);
      }

    } else if (decoded.type === "patient") {
      user = await Patient.findByPk(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token invalid",
      });
    }

    req.user = user;
    req.userType = decoded.type;
  // expose the raw id from the token for convenience in controllers
  req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.userType !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can access this route",
      });
    }

    const userRoles = req.user.roleNames || [];
    const isAuthorized = roles.some(role => userRoles.includes(role));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Employee roles [${userRoles.join(", ")}] are not authorized to access this route`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,

}
