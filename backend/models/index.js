const User = require("./User");
const Doctor = require("./Doctor");

User.hasOne(Doctor, { foreignKey: "userId" });
module.exports = {
  User,
  Doctor,
};