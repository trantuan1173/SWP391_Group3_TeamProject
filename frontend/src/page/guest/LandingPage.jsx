import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <section className="pt-[100px] pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="w-[80%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                VỀ CHÚNG TÔI
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                CHUYÊN MÔN Y TẾ VÀ<br />
                CHĂM SÓC SỨC KHỎE
              </h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Chúng tôi cung cấp dịch vụ chăm sóc toàn diện và cá nhân hóa cho từng bệnh nhân 
                bằng phương pháp tiếp cận dựa trên bằng chứng kết hợp với y học lâm sàng.
              </p>
              <button
                onClick={() => navigate("/news")}
                className="bg-green-800 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-900 transition shadow-lg"
                style={{ borderRadius: "30px" }}
              >
                ĐỌC THÊM
              </button>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800"
                    alt="Medical Team"
                    className="w-full h-[300px] object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400"
                    alt="MWI Clinic"
                    className="w-full h-[200px] object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400"
                    alt="Doctor Consultation"
                    className="w-full h-[200px] object-cover"
                  />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-green-50">
        <div className="w-[80%] mx-auto text-center">
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
            CMS mang sứ mệnh <span className="font-bold text-green-800">"Định nghĩa lại Y tế & Sức khỏe Tối Ưu"</span>.
            <br />
            Chúng tôi cam kết trở thành phòng khám bác sĩ gia đình hàng đầu tại Việt Nam, với tiêu chuẩn cao về chất lượng dịch vụ y tế và sự hài lòng của bệnh nhân.
          </p>
        </div>
      </section>
      <section id="services" className="py-16 bg-gradient-to-b from-white to-green-50">
        <div className="w-[80%] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              DỊCH VỤ CỦA CHÚNG TÔI
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              CHĂM SÓC CÁ NHÂN<br />DÀNH CHO MỌI NGƯỜI
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Phòng khám CMS tọa lạc tại abc, Quận xyz, TP.Hà Nội - 
              với trang thiết bị hiện đại và không gian được thiết kế mang lại sự thoải mái, 
              an tâm cho bệnh nhân.
            </p>
          </div>
        </div>
      </section>
      <section className="py-16 bg-green-800 text-white">
        <div className="w-[80%] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng chăm sóc sức khỏe của bạn?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Đặt lịch khám ngay hôm nay để nhận được sự chăm sóc tốt nhất
          </p>
          <button
            onClick={() => navigate("/book")}
            className="bg-white text-green-800 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl"
            style={{ borderRadius: "104px" }}
          >
            ĐẶT LỊCH NGAY
          </button>
        </div>
      </section>
      <Footer />
    </>
  );
}
