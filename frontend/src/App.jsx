import { AuthProvider } from './context/AuthContext'
import { Routes, Route } from 'react-router-dom'
import BookMedicalExam from "./page/guest/BookMedicalExam";
import ListDoctor from "./page/guest/ListDoctor";
import DoctorSchedule from "./page/doctor/DoctorSchedule";
import PatientDashboard from './page/Patient/PatientDashboard'
import Login from "./page/Auth/Login";
import Register from "./page/Auth/Register";
import VerifyPage from "./page/Auth/VerifyPage";
import UserManagement from "./page/AdminUserManager/UserManagement";
import AdminDashboard from "./page/AdminDashboard/AdminDashboard";
import UserDetailManagement from "./page/AdminUserManager/UserDetailManagement";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={<BookMedicalExam />} />
        <Route path="/book" element={<BookMedicalExam />} />
        <Route path="/doctor" element={<ListDoctor />} />

        {/* Patient Dashboard routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-dashboard/:id" element={<PatientDashboard />} />

        {/* Doctor Schedule routes */}
        <Route path="/doctor/:doctorId/schedule" element={<DoctorSchedule />} />  

        {/* Admin routes */}      
        <Route path="/admin/user" element={<UserManagement />}></Route>
        <Route
          path="/admin/user/:id"
          element={<UserDetailManagement />}
        ></Route>
        <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
