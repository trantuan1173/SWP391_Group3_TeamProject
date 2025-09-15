import React, { useState } from "react";
import { Clock } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import PatientInfo from "./components/PatientInfo";
import Prescriptions from "./components/Prescriptions";
import Checkups from "./components/Checkups";
import Documents from "./components/Documents";
import Payments from "./components/Payments";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("Prescription");
  const tabs = ["Prescription", "Checkups", "Document's", "Payments"];

  // Data
  const prescriptions = [
    {
      doctor: "Dr. Paul",
      date: "01/01/2023",
      time: "12:30",
      medication:
        "Codeine Linctus (G/5gal) X 400 Ml To Be Taken As Directed",
    },
    {
      doctor: "Dr. Paul",
      date: "17/01/2023",
      time: "12:30",
      medication:
        "Usual Dosage For Adults Is 5 To 10 Ml, 3 To 4 Times Daily.",
    },
  ];

  const checkups = [
    { date: "01/01/2023", time: "12:30", treatment: "MRI", doctor: "Dr. Paul MBBS, MS", comment: "Excess Amount Glucose" },
    { date: "07/01/2023", time: "13:30", treatment: "CGB", doctor: "Dr. Jenni MBBS, MS", comment: "Control Blood Pressure" },
    { date: "15/01/2023", time: "13:30", treatment: "VJB", doctor: "Dr. Jenni MBBS, MS", comment: "Fever" },
    { date: "17/01/2023", time: "15:30", treatment: "Tissue", doctor: "Dr. Paul MBBS, MS", comment: "Good Condition" },
    { date: "21/01/2023", time: "20:30", treatment: "Bone", doctor: "Dr. Paul MBBS, MS", comment: "Good Condition" },
  ];

  const documents = [
    { date: "01/01/2023", time: "12:30", treatment: "MRI" },
    { date: "07/01/2023", time: "13:30", treatment: "CGB" },
    { date: "15/01/2023", time: "13:30", treatment: "VJB" },
    { date: "17/01/2023", time: "15:30", treatment: "Tissue" },
    { date: "21/01/2023", time: "20:30", treatment: "Bone" },
    { date: "27/01/2023", time: "23:30", treatment: "Full Body" },
  ];

  const payments = [
    { date: "01/01/2023", time: "12:30", treatment: "MRI", amount: 852.0 },
    { date: "07/01/2023", time: "13:30", treatment: "CGB", amount: 352.0 },
    { date: "15/01/2023", time: "13:30", treatment: "VJB", amount: 120.0 },
    { date: "17/01/2023", time: "15:30", treatment: "Tissue", amount: 552.0 },
    { date: "21/01/2023", time: "20:30", treatment: "Bone", amount: 552.0 },
    { date: "27/01/2023", time: "23:30", treatment: "Full Body", amount: 365.0 },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col rounded-l-3xl overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-4 shadow flex items-center justify-between">
          {/* Search with filter + icon */}
          <div className="flex items-center border rounded-full overflow-hidden w-[420px] bg-gray-50">
            {/* Filter icon */}
            <button className="px-3 text-gray-500 hover:text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M9 10.5h12M15 16.5h6" />
              </svg>
            </button>
            <input type="text" placeholder="Search..." className="flex-1 px-3 py-2 bg-transparent outline-none text-sm" />
            <button className="px-3 text-gray-500 hover:text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          </div>
          <div className="w-10 h-10 border rounded-full flex items-center justify-center bg-gray-50">
            <Clock size={20} className="text-gray-600" />
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Patient Info */}
          <PatientInfo />

          {/* Show January only for some tabs */}
          {["Checkups", "Document's", "Payments"].includes(activeTab) && (
            <h2 className="text-lg font-semibold text-center mb-4">January</h2>
          )}

          {/* Tabs */}
          <div className="flex gap-3 mb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium shadow transition ${
                  activeTab === tab
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            {activeTab === "Prescription" && (
              <Prescriptions data={prescriptions} />
            )}
            {activeTab === "Checkups" && <Checkups data={checkups} />}
            {activeTab === "Document's" && <Documents data={documents} />}
            {activeTab === "Payments" && <Payments data={payments} />}
          </div>
        </main>
      </div>
    </div>
  );
}
