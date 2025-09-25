import React from "react";

export default function Prescriptions({ data }) {
  if (!data.length) return <p>No prescriptions found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((p, i) => (
        <div
          key={i}
          className="rounded-2xl p-6 shadow flex flex-col justify-between h-full"
          style={{ backgroundColor: "#D9D9D9" }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-green-700">
              {p.Doctor?.User?.name || "Unknown Doctor"}
            </h3>
            <span className="text-sm text-gray-700 font-medium">
              {p.createdAt?.slice(0, 10) || ""}
            </span>
          </div>
          <p className="text-black text-base mt-2">
            {p.treatment || p.diagnosis || "No details"}
          </p>
        </div>
      ))}
    </div>
  );
}
