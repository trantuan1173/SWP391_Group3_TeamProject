import React from "react";

export default function Checkups({ data }) {
  if (!data.length) return <p>No checkups found.</p>;

  return (
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3">Date</th>
          <th className="p-3">Start - End</th>
          <th className="p-3">Doctor</th>
          <th className="p-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c, i) => (
          <tr key={i} className="border-b">
            <td className="p-3">{c.date}</td>
            <td className="p-3">
              {c.startTime} - {c.endTime}
            </td>
            <td className="p-3">{c.Doctor?.User?.name || "Unknown"}</td>
            <td className="p-3">{c.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
