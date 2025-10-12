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
// const getEmployeeWithRole = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const employee = await Employee.findByPk(id, {
//       include: [
//         {
//           model: EmployeeRole,
//           as: "employeeRoles",
//           include: [
//             {
//               model: Role,
//               as: "role",
//               attributes: ["id", "name"]
//             }
//           ]
//         }
//       ]
//     });

//     if (!employee) {
//       return res.status(404).json({ error: "Không tìm thấy nhân viên" });
//     }

//     // Lấy danh sách roles
//     const roles = employee.employeeRoles.map(er => ({
//       id: er.role.id,
//       name: er.role.name
//     }));

//     res.json({
//       id: employee.id,
//       name: employee.name,
//       email: employee.email,
//       roles,
//       isDoctor: roles.some(role => role.id === 2) // Check nếu có role Doctor (id=2)
//     });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Lỗi server" });
//   }
// };


// Lấy thông tin employee kèm role
const getEmployeeWithRole = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Role,
          as: "roles", // ✅ Sử dụng alias từ belongsToMany
          through: { attributes: [] }, // Ẩn bảng trung gian
          attributes: ["id", "name"]
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
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


// const register = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       identityNumber,
//       phoneNumber,
//       dateOfBirth,
//       gender,
//       address,
//     } = req.body;

//     let user = await User.findOne({ where: { identityNumber } });

//     if (user && user.isActive === true) {
//       return res
//         .status(409)
//         .json({ error: "Identity number already exists and is active" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     if (user && user.isActive === false) {
//       await user.update({
//         name,
//         email,
//         password,
//         phoneNumber,
//         dateOfBirth,
//         gender,
//         address,
//       });

//       const patient = await Patient.findOne({ where: { userId: user.id } });

//       user.otp = otp;
//       user.otpExpires = Date.now() + 10 * 60 * 1000;
//       await user.save();

//       try {
//         await sendVerifyEmail(email, otp);
//         const loginToken = generateToken(user.id);

//         return res.status(201).json({
//           success: true,
//           message:
//             "Registration successful! Please check your email to verify your account.",
//           data: { user, patient, token: loginToken },
//         });
//       } catch (emailError) {
//         console.error("Failed to send verification email:", emailError);
//         const loginToken = generateToken(user.id);

//         return res.status(202).json({
//           success: true,
//           message:
//             "Registration successful, but failed to send verification email. Please try logging in later to resend verification.",
//           data: { user, patient, token: loginToken },
//         });
//       }
//     }

//     user = await User.create({
//       name,
//       email,
//       password,
//       identityNumber,
//       phoneNumber,
//       dateOfBirth,
//       gender,
//       address,
//     });

//     const patient = await Patient.create({ userId: user.id });

//     user.otp = otp;
//     user.otpExpires = Date.now() + 10 * 60 * 1000;
//     await user.save();

//     try {
//       await sendVerifyEmail(email, otp);
//       const loginToken = generateToken(user.id);

//       return res.status(201).json({
//         success: true,
//         message:
//           "Registration successful! Please check your email to verify your account.",
//         data: { user, patient, token: loginToken },
//       });
//     } catch (emailError) {
//       console.error("Failed to send verification email:", emailError);
//       const loginToken = generateToken(user.id);

//       return res.status(202).json({
//         success: true,
//         message:
//           "Registration successful, but failed to send verification email. Please try logging in later to resend verification.",
//         data: { user, patient, token: loginToken },
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to register user" });
//   }
// };

// const verifyUser = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     if (user.isActive) {
//       return res
//         .status(400)
//         .json({ success: false, message: "User already verified" });
//     }

//     if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
//       return res
//         .status(400)
//         .json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn" });
//     }

//     user.isActive = true;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     res.status(200).json({ success: true, message: "Xác minh thành công" });
//   } catch (error) {
//     console.error("Verify error:", error);
//     res.status(500).json({ success: false, message: "Lỗi server" });
//   }
// };

//Employee login (Log)
const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({
      where: { email },
      include: [{ model: Role }]
    });
    // if (!employee.isActive) {
    //   return res.status(401).json({ error: "User not verified" });
    // }
    if (!employee) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!employee.comparePassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // //Check role
    // if (employee.role.name === "doctor") {
    //   return res.status(200).json({ employee, token: generateToken(employee.id, "doctor") });
    // }
    // if (employee.role.name === "staff") {
    //   return res.status(200).json({ employee, token: generateToken(employee.id, "staff") });
    // }
    // if (employee.role.name === "admin") {
    //   return res.status(200).json({ employee, token: generateToken(employee.id, "admin") });
    // }
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
    const employee = await Employee.findByPk(decodedToken.id);

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
