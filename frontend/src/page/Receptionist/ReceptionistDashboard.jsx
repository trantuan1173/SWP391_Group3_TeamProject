import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { CalendarDays, CreditCard, Check, Loader } from "lucide-react";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_TODAY_APPOINTMENTS,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        setAppointments(res.data || []);
        console.log(appointments);
      } catch (error) {
        console.error("Failed to fetch today's appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayAppointments();
  }, []);


  const totalAppointments = appointments.length;
  const toPaymentCount = appointments.filter(
    (a) => a.status === "to-payment"
  ).length;
  const pendingCount = appointments.filter(a => a.status === "pending").length;
  const completedCount = appointments.filter(a => a.status === "completed").length;
  const confirmedCount = appointments.filter(a => a.status === "confirmed").length;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Receptionist Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 border border-blue-300 rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="bg-blue-500 text-white p-3 rounded-full">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Total Appointments
            </h2>
            <p className="text-3xl font-bold text-blue-700">
              {loading ? <Loader className="animate-spin" /> : totalAppointments}
            </p>
            <p className="text-sm text-gray-500 mt-1">For today</p>
          </div>
        </div>
        <div className="bg-violet-100 border border-violet-300 rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="bg-violet-500 text-white p-3 rounded-full">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Confirmed Appointments
            </h2>
            <p className="text-3xl font-bold text-violet-700">
              {loading ? <Loader className="animate-spin" /> : confirmedCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">For today</p>
          </div>
        </div>

        <div className="bg-orange-100 border border-orange-300 rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="bg-orange-500 text-white p-3 rounded-full">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Pending Appointments
            </h2>
            <p className="text-3xl font-bold text-orange-700">
              {loading ? <Loader className="animate-spin" /> : pendingCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">Waiting for confirmation</p>
          </div>
        </div>

        <div className="bg-yellow-100 border border-yellow-300 rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="bg-yellow-500 text-white p-3 rounded-full">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Awaiting Payment
            </h2>
            <p className="text-3xl font-bold text-yellow-700">
              {loading ? <Loader className="animate-spin" /> : toPaymentCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">Completed & Unpaid</p>
          </div>
        </div>

        <div className="bg-green-100 border border-green-300 rounded-lg shadow-sm p-6 flex items-center gap-4">
          <div className="bg-green-500 text-white p-3 rounded-full">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Completed Appointments
            </h2>
            <p className="text-3xl font-bold text-green-700">
              {loading ? <Loader className="animate-spin" /> : completedCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">Completed Appointments</p>
          </div>
        </div>
      </div>
    </div>
  );
}