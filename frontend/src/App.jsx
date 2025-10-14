import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import BookMedicalExam from "./page/guest/BookMedicalExam";
import ListDoctor from "./page/guest/ListDoctor";
import DoctorSchedule from "./page/doctor/DoctorSchedule";
import QuickBook from "./page/Patient/QuickBook";
import PatientDashboard from "./page/Patient/PatientDashboard";
import Doctors from "./page/Patient/Doctors";
import PatientEdit from "./page/Patient/PatientEdit";
import PatientProfile from "./page/Patient/PatientProfile";
import PatientLayout from "./layout/PatientLayout";
import Login from "./page/Auth/Login";
import Register from "./page/Auth/Register";
import VerifyPage from "./page/Auth/VerifyPage";
import UserManagement from "./page/AdminUserManager/UserManagement";
import AdminDashboard from "./page/AdminDashboard/AdminDashboard";
import UserDetailManagement from "./page/AdminUserManager/UserDetailManagement";
import RequireAuth from "./context/RequireAuth";
import PatientOnly from "./context/PatientOnly";
import LandingPage from "./page/guest/LandingPage";
import ContactUs from "./page/guest/ContactUs";
import ReceptionistSideBar from "./components/Receptionnist/ReceptionistSideBar";
import ReceptionistDashboard from "./page/Receptionist/ReceptionistDashboard";
import ReceptionistPatient from "./page/Receptionist/ReceptionistPatient";
import ReceptionistAppointment from "./page/Receptionist/ReceptionistAppointment";
import ReceptionistDoctor from "./page/Receptionist/ReceptionistDoctor";
import ReceptionistNews from "./page/Receptionist/ReceptionistNews";

function App() {
  const RedirectPatientId = () => {
    const { id } = useParams();
    return <Navigate to={`/patient/${id}`} replace />;
  };

  return (
    <AuthProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/book" element={<BookMedicalExam />} />
        <Route path="/appointment" element={<QuickBook />} />
        <Route path="/doctor" element={<ListDoctor />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Patient Dashboard routes */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path=":id/edit" element={<PatientEdit />} />
          <Route path=":id/profile" element={<PatientProfile />} />
          <Route element={<PatientOnly />}>
            <Route path=":id" element={<PatientDashboard />} />
          </Route>
        </Route>

        {/* Legacy routes -> redirects to new /patient paths */}
        <Route
          path="/patient-dashboard"
          element={<Navigate to="/patient" replace />}
        />
        <Route path="/patient-dashboard/:id" element={<RedirectPatientId />} />

        {/* Doctor Schedule routes */}
        <Route path="/doctor/schedule" element={<DoctorSchedule />} />

        {/* Admin routes */}
        <Route path="/admin/user" element={<UserManagement />}></Route>
        <Route
          path="/admin/user/:id"
          element={<UserDetailManagement />}
        ></Route>
        <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
        <Route element={<RequireAuth allowedRoles={["admin"]} />}>
          <Route path="/admin/user" element={<UserManagement />}></Route>
          <Route
            path="/admin/user/:id"
            element={<UserDetailManagement />}
          ></Route>
          <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
        </Route>
        <Route element={<RequireAuth allowedRoles={["Receptionist"]} />}>
          <Route path="/receptionist" element={<ReceptionistSideBar />}>
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="patients" element={<ReceptionistPatient />} />
            <Route path="appointments" element={<ReceptionistAppointment />} />
            <Route path="doctors" element={<ReceptionistDoctor />} />
            <Route path="news" element={<ReceptionistNews />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
