import React from "react";
import Header from "../../components/guestlayout/Header";
import Footer from "../../components/guestlayout/Footer";

export default function ContactUs() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-[100px] pb-8 bg-gradient-to-b from-green-50 to-white">
        <div className="w-[80%] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Liên Hệ
          </h1>
          <p className="text-gray-600 text-lg">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 bg-white">
        <div className="w-[80%] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            
            {/* Đường dây nóng & Email */}
            <div className="bg-green-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Đường dây nóng & Email
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">ĐT:</span> 012 34 567 890
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Di động:</span> +84 xxx xxx xxx
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span> 
                  <a href="mailto:info@abc.com.vn" className="text-green-800 hover:underline">
                    info@abc.com.vn
                  </a>
                </p>
              </div>
            </div>

            {/* Vị trí của chúng tôi */}
            <div className="bg-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Vị trí của chúng tôi
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Đại học FPT Hà Nội
                </p>
                <p>
                  Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long
                </p>
                <p>
                  Thạch Thất, Hà Nội, Việt Nam
                </p>
                <p className="text-sm text-gray-500 italic mt-4">
                  (Gần Công viên phần mềm Quang Trung)
                </p>
              </div>
            </div>

            {/* Hướng dẫn đỗ xe */}
            <div className="bg-orange-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-orange-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Hướng dẫn đỗ xe
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  Vui lòng gửi xe máy hoặc ô tô tại bãi đỗ xe của trường.
                </p>
                <p>
                  <span className="font-semibold">Bãi xe máy:</span> Khu A, B, C
                </p>
                <p>
                  <span className="font-semibold">Bãi ô tô:</span> Tầng hầm B1
                </p>
                <p className="text-sm text-green-800 font-semibold mt-4">
                  ⏰ Miễn phí đỗ xe cho khách hàng
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="w-[80%] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bản Đồ Chỉ Đường
            </h2>
            <p className="text-gray-600">
              Tìm đường đến phòng khám của chúng tôi
            </p>
          </div>

          {/* Google Map Embed */}
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.657837435831!2d105.52460731493236!3d21.01330959313684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345b465a4e65fb%3A0xaae6040cfabe8fe!2zxJDhuqFpIGjhu41jIEZQVCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
              height="500" width="100%"
            ></iframe>
          </div>

          {/* Directions Button */}
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/dir//Đại+học+FPT+Hà+Nội"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-800 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-900 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Chỉ đường trên Google Maps
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
