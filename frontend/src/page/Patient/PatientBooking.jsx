import PatientLayout from "../../layout/PatientLayout";

export default function PatientBooking() {
  return (
    <PatientLayout>
      {/* Booking UI sẽ được chuyển từ PatientDashboard.jsx sang đây */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Đặt lịch khám</h2>
        {/* ...booking form... */}
      </div>
    </PatientLayout>
  );
}
