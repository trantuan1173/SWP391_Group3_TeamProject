import PatientLayout from "../../layout/PatientLayout";

export default function PatientRecords() {
  return (
    <PatientLayout>
      {/* Hồ sơ y tế UI sẽ được chuyển từ PatientDashboard.jsx sang đây */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Hồ sơ y tế</h2>
        {/* ...medical records... */}
      </div>
    </PatientLayout>
  );
}
