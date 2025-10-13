import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import BookMedicalExam from "./page/guest/BookMedicalExam";
import ListDoctor from "./page/guest/ListDoctor";
import DoctorSchedule from "./page/doctor/DoctorSchedule";
import QuickBook from "./page/Patient/QuickBook";
import PatientDashboard from "./page/Patient/PatientDashboard";
import Login from "./page/Auth/Login";
import Register from "./page/Auth/Register";
import VerifyPage from "./page/Auth/VerifyPage";
import UserManagement from "./page/AdminUserManager/UserManagement";
import AdminDashboard from "./page/AdminDashboard/AdminDashboard";
import UserDetailManagement from "./page/AdminUserManager/UserDetailManagement";
import RequireAuth from "./context/RequireAuth";
import LandingPage from "./page/guest/LandingPage";
import ContactUs from "./page/guest/ContactUs";

function App() {
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
        {/* <Route path="/appointment" element={<QuickBook />} /> */}
        <Route path="/doctor" element={<ListDoctor />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Patient Dashboard routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-dashboard/:id" element={<PatientDashboard />} />

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
      </Routes>
    </AuthProvider>
  );
}

export default App;
