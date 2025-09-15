import React from "react";

export default function Checkups({ data }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3">Date & Time</th>
          <th className="p-3">Treatment</th>
          <th className="p-3">Doctor</th>
          <th className="p-3">Comments</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c, i) => (
          <tr key={i} className="border-b">
            <td className="p-3">{c.date} {c.time}</td>
            <td className="p-3">{c.treatment}</td>
            <td className="p-3">{c.doctor}</td>
            <td className="p-3">{c.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
