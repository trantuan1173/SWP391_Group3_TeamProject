import PatientLayout from "../../layout/PatientLayout";

export default function PatientAppointments() {
  return (
    <PatientLayout>
      {/* Lịch khám UI sẽ được chuyển từ PatientDashboard.jsx sang đây */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Lịch khám của bạn</h2>
        {/* ...appointments list... */}
      </div>
    </PatientLayout>
  );
}
