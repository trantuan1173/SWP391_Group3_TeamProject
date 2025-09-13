const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendVerifyEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const verifyLink = `${process.env.FRONTEND_URL}/verify`;

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello,</h2>
        <p>${otp} is your verification code</p>
        <p>If you did not register an account, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">You received this email because you registered at our system.</p>
        <p style="font-size: 12px; color: #777;">Company address: FPT University, District Hoa Lan, Ha Noi City</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendStaffVerifyEmail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const verifyLink = `${process.env.FRONTEND_URL}/verify`;

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your account has been created`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello,</h2>
        <p>Your account has been created</p>
        <p>Your password is: ${password}</p>
        <p>Please login to your account to change your password</p>
        <p>If you did not register an account, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">You received this email because you registered at our system.</p>
        <p style="font-size: 12px; color: #777;">Company address: FPT University, District Hoa Lan, Ha Noi City</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


const sendForgotPasswordEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello,</h2>
        <p>${otp} is your verification code</p>
        <p>If you did not register an account, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">You received this email because you registered at our system.</p>
        <p style="font-size: 12px; color: #777;">Company address: FPT University, District Hoa Lan, Ha Noi City</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerifyEmail,
  sendForgotPasswordEmail,
  sendStaffVerifyEmail,
};
