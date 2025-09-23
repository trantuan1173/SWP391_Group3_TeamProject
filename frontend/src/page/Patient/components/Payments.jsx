import React from "react";

export default function Payments({ data }) {
  const totalPaid = data.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Treatment</th>
              <th className="p-3">Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="p-3">{p.date} {p.time}</td>
                <td className="p-3">{p.treatment}</td>
                <td className="p-3">${p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-orange-100 p-6 rounded-xl shadow">
        <h3 className="font-bold mb-4">Fully Paid</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Amount</span>
            <span>${totalPaid}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid</span>
            <span>${totalPaid}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>$0</span>
          </div>
          <div className="flex justify-between">
            <span>Deposit</span>
            <span>$0</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Balance</span>
            <span>$0</span>
          </div>
        </div>
        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
          Advance To Pay
        </button>
      </div>
    </div>
  );
}
