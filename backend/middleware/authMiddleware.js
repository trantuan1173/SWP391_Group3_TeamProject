const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Protect routes
const protect = async function(req, res, next) {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // Get token from header
    token = req.headers.authorization.split(" ")[1]
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    // Get user from token
    req.user = await User.findByPk(decoded.id)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}

// Grant access to specific roles
const authorize = function() {
  var roles = Array.prototype.slice.call(arguments);
  return async function(req, res, next) {
    // Get user role
    const user = await User.findByPk(req.user.id)

    if (!user || !user.role) {
      return res.status(403).json({
        success: false,
        message: "User role not found",
      })
    }

    // Check if user role is authorized
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${user.role} is not authorized to access this route`,
      })
    }

    next()
  }
}

module.exports = {
  protect,
  authorize,
}
