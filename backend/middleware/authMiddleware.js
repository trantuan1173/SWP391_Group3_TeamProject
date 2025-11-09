const jwt = require("jsonwebtoken");
const { Employee, Patient, Role } = require("../models");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    let user = null;

    if (decoded.type === "employee") {
      const emp = await Employee.findByPk(decoded.id, {
        include: { model: Role, as: "roles", through: { attributes: [] } },
      });
      if (!emp)
        return res
          .status(401)
          .json({ success: false, message: "User not found or token invalid" });

      const json = emp.toJSON();
      const roleNames = (json.roles || []).map((r) => r.name).filter(Boolean);
      const roleNamesLower = roleNames.map((r) => String(r).toLowerCase());

      req.user = {
        ...json,
        roleNames,
        roleNamesLower,
        role: roleNames[0] || "",
        roleLower: roleNamesLower[0] || "",
        id: json.id,
      };
      req.userType = "employee";
    } else if (decoded.type === "patient") {
      const pat = await Patient.findByPk(decoded.id);
      if (!pat)
        return res
          .status(401)
          .json({ success: false, message: "User not found or token invalid" });

      const json = pat.toJSON();
      req.user = {
        ...json,
        role: "patient",
        roleLower: "patient",
        roleNames: ["patient"],
        roleNamesLower: ["patient"],
        id: json.id,
      };
      req.userType = "patient";
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token type" });
    }

    // tiện cho controller
    req.userId = req.user.id;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, invalid token" });
  }
};

const authorize = (...allowed) => {
  const allowSet = new Set(allowed.map((r) => String(r).toLowerCase()));
  return (req, res, next) => {
    if (req.userType !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can access this route",
      });
    }
    const roles = req.user?.roleNamesLower || [];
    const ok = roles.some((r) => allowSet.has(r));
    if (!ok) {
      return res.status(403).json({
        success: false,
        message: `Employee roles [${(req.user.roleNames || []).join(
          ", "
        )}] are not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
