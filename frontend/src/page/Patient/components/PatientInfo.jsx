import React from "react";

export default function PatientInfo() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex items-start gap-6">
        {/* Patient Photo */}
        <div className="w-[260px] h-[158px] rounded-[24px] overflow-hidden bg-gray-200">
          <img
            src="/icon/Mathews.jpg"
            alt="Miss Mathews"
            className="w-full h-full object-cover"
            style={{ opacity: 1, transform: "rotate(0deg)" }}
          />
        </div>

        {/* Patient Info */}
        <div className="flex-1">
          <h2 className="font-bold text-lg mb-2">Miss. Mathews</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-bold">Age:</span> 32{" "}
              <span className="ml-6 font-bold">Sex:</span> F
            </div>
            <div>
              <span className="font-bold">Phone:</span> 321-255-35595
            </div>
            <div>
              <span className="font-bold">E-mail:</span>{" "}
              Mathewssellyss@Hotmail.Com
            </div>
            <div>
              <span className="font-bold">Address:</span> 18 Main St,
              Las Vegas, Nevada.
            </div>
          </div>
        </div>

        {/* Health Circles */}
        <div className="flex gap-6">
          {[
            { label: "Sugar", value: 88, note: "81/72" },
            { label: "Oxygen", value: 66, note: "118/120" },
            { label: "Blood Pressure", value: 50, note: "118/90" },
          ].map((circle, idx) => (
            <div className="text-center" key={idx}>
              <div className="relative w-[119px] h-[167px] mb-1">
                <svg
                  className="w-[119px] h-[167px] transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                    fill="#FCFF7F"
                    stroke="#D9D9D9"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                    fill="none"
                    stroke="#2CAA00"
                    strokeWidth="3"
                    strokeDasharray={`${circle.value},100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-green-600">
                    {circle.value}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600">{circle.note}</div>
              <div className="text-xs font-bold">{circle.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
