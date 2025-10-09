import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Sử dụng Header component có sẵn */}
      <Header />

      {/* Hero Section */}
      <section className="pt-[100px] pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="w-[80%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
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
                onClick={() => navigate("#")}
                className="bg-green-800 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-900 transition shadow-lg"
                style={{ borderRadius: "30px" }}
              >
                ĐỌC THÊM
              </button>
            </div>

            {/* Right Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Main Image - Team */}
                <div className="col-span-2 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800"
                    alt="Medical Team"
                    className="w-full h-[300px] object-cover"
                  />
                </div>
                
                {/* Bottom Left - Clinic */}
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400"
                    alt="MWI Clinic"
                    className="w-full h-[200px] object-cover"
                  />
                </div>

                {/* Bottom Right - Doctor Consultation */}
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400"
                    alt="Doctor Consultation"
                    className="w-full h-[200px] object-cover"
                  />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-green-50">
        <div className="w-[80%] mx-auto text-center">
          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
            ABC mang sứ mệnh <span className="font-bold text-green-800">"Định nghĩa lại Y tế & Sức khỏe Tối Ưu"</span>.
            <br />
            Chúng tôi cam kết trở thành phòng khám bác sĩ gia đình hàng đầu tại Việt Nam, với tiêu chuẩn cao về chất lượng dịch vụ y tế và sự hài lòng của bệnh nhân.
          </p>
        </div>
      </section>

      {/* Services Section */}
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
              Phòng khám ABC tọa lạc tại Vinhome Central Park, Quận Bình Thạnh, TP.HCM - 
              với trang thiết bị hiện đại và không gian được thiết kế mang lại sự thoải mái, 
              an tâm cho bệnh nhân.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Phòng khám bác sĩ gia đình",
                image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400",
                color: "bg-pink-100"
              },
              {
                title: "Điều trị nước ngoài & hộ tống y tế",
                image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400",
                color: "bg-blue-100"
              },
              {
                title: "Thăm khám bác sĩ tại nhà",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
                color: "bg-green-100"
              },
              {
                title: "Y học thể thao",
                image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
                color: "bg-orange-100"
              }
            ].map((service, index) => (
              <div key={index} className={`${service.color} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group`}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <button className="flex items-center gap-2 text-green-800 font-semibold hover:gap-3 transition-all">
                    <span>Xem thêm</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
