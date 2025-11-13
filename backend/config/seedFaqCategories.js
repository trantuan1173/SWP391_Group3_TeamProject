const { sequelize } = require("../config/db");
const Category = require("../models/Category");

(async () => {
  try {
    await sequelize.authenticate();

    const CATS = [
      {
        name: "Đặt lịch & Lịch khám",
        description:
          "Hướng dẫn đặt lịch, đổi lịch, và chuẩn bị trước khi đi khám",
      },
      {
        name: "Thanh toán & Bảo hiểm",
        description:
          "Thông tin về hóa đơn, thanh toán, và bảo hiểm y tế/đối tác",
      },
      {
        name: "Tài khoản bệnh nhân",
        description: "Đăng ký, đăng nhập, OTP, và cập nhật hồ sơ cá nhân",
      },
      {
        name: "Dịch vụ & Bác sĩ",
        description: "Danh sách chuyên khoa, bác sĩ, và thời gian làm việc",
      },
      {
        name: "Kết quả & Hồ sơ bệnh án",
        description: "Xem kết quả xét nghiệm, đơn thuốc, và hồ sơ khám bệnh",
      },
      {
        name: "Nhà thuốc & Đơn thuốc",
        description: "Cách nhận thuốc, gia hạn đơn, và thông tin thuốc kê toa",
      },
    ];

    for (const c of CATS) {
      await Category.findOrCreate({
        where: { name: c.name },
        defaults: { description: c.description },
      });
    }

    console.log("✅ Đã khởi tạo 6 danh mục FAQ cho bệnh viện WedMed");
    process.exit(0);
  } catch (e) {
    console.error("❌ Lỗi khi seed dữ liệu FAQ categories:", e);
    process.exit(1);
  }
})();
