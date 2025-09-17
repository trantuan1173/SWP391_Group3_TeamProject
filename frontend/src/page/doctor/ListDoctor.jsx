import React from "react";
import Header from "../../components/Header";

export default function ListDoctor() {
  return (
    <>
      <Header />
      <div className="bg-[#f6fff4] min-h-screen pt-8">
        <div className="w-[80%] mx-auto flex flex-row gap-8 mt-[30px]">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Box */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center w-[500px] h-[50px] border border-gray-400 rounded-full px-6 bg-white">
                <input
                  type="text"
                  placeholder="Tìm kiếm bác sĩ..."
                  className="flex-1 bg-transparent outline-none text-lg"
                />
                <button className="mr-4">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <button>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="10" width="16" height="2" rx="1" />
                    <rect x="7" y="6" width="10" height="2" rx="1" />
                    <rect x="10" y="14" width="4" height="2" rx="1" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Filter */}
            <div className="flex justify-center gap-16 mb-8">
              <button className="text-black text-xl font-semibold flex items-center gap-2">
                Chuyên khoa <span className="text-lg">&#9660;</span>
              </button>
              <button className="text-black text-xl font-semibold flex items-center gap-2">
                Học vị <span className="text-lg">&#9660;</span>
              </button>
            </div>
            {/* Doctor List */}
            <div>
              <div className="text-lg font-bold mb-4">Danh Sách Bác Sĩ</div>
              <div className="space-y-6">
                {/* Doctor 1 */}
                <div className="flex items-center gap-4">
                  
                </div>
                <hr />
                {/* Doctor 2 */}
                <div className="flex items-center gap-4">
                  
                </div>
                <hr />
                {/* Doctor 3 */}
                <div className="flex items-center gap-4">
                  
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-[300px]">
            <div className="bg-[#ffe3d1] rounded-xl shadow-md p-6">
              <div className="font-bold text-lg mb-4">Chuyên Khoa</div>
              <div className="space-y-3 text-gray-800 text-base">
                <div className="flex justify-between">
                  <span>Sản Phụ Khoa</span>
                  <span>15 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Mắt</span>
                  <span>20 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tai - Mũi - Họng</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Nhi</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Cơ Xương Khớp</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Nội Tim Mạch</span>
                  <span>10 Bác Sĩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Thần Kinh</span>
                  <span>10 Bác Sĩ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}