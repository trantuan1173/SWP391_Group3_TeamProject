import React from "react";

export default function PatientInfo({ patient }) {
  if (!patient || !patient.user) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 text-center text-gray-500">
        Không có thông tin bệnh nhân.
      </div>
    );
  }
  console.log("Avatar value:", patient.user.avatar);

  // Tính tuổi từ dateOfBirth
  const calcAge = (dob) => {
    if (!dob) return "-";
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-start gap-6">
        {/* Patient Photo */}
        <div className="w-[260px] h-[158px] rounded-[24px] overflow-hidden bg-gray-200">
  <img
  src={
    patient.user.avatar
      ? `http://localhost:1118/uploads/avatars/${patient.user.avatar.replace('/uploads/avatars/', '')}`
      : "https://via.placeholder.com/260x158"
  }
  alt={patient.user.name}
  className="w-full h-full object-cover"
/>
        </div>

        {/* Patient Info */}
        <div className="flex-1">
          <h2 className="font-bold text-lg mb-2">{patient.user.name}</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-bold">Age:</span> {calcAge(patient.user.dateOfBirth)}
              <span className="ml-6 font-bold">Sex:</span> {patient.user.gender}
            </div>
            <div>
              <span className="font-bold">Phone:</span> {patient.user.phoneNumber}
            </div>
            <div>
              <span className="font-bold">E-mail:</span> {patient.user.email}
            </div>
            <div>
              <span className="font-bold">Address:</span> {patient.user.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}