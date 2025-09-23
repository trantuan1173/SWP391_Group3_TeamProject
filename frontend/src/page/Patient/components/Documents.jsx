import React from "react";

export default function Documents({ data }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3">Date & Time</th>
          <th className="p-3">Treatment</th>
          <th className="p-3">Download</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i} className="border-b">
            <td className="p-3">
              {d.createdAt ? d.createdAt.slice(0, 10) : ""} {/* Ngày */}
              {d.createdAt ? " " + (d.createdAt.slice(11, 19)) : ""} {/* Giờ */}
            </td>
            <td className="p-3">{d.treatment || d.diagnosis || "No details"}</td>
            <td className="p-3">
              <button className="text-green-600 hover:underline">⬇ Download</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}