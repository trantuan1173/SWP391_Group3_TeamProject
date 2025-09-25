import { AuthProvider } from './context/AuthContext'
import { Routes, Route } from 'react-router-dom'
import Login from './page/Auth/Login'
import Register from './page/Auth/Register'
import VerifyPage from './page/Auth/VerifyPage'

function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={<BookMedicalExam />} />
        <Route path="/book" element={<BookMedicalExam />} />
        <Route path="/doctor" element={<ListDoctor />} />

        {/* Patient Dashboard routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-dashboard/:id" element={<PatientDashboard />} />
        <Route path="/admin/user" element={<UserManagement />}></Route>
        <Route
          path="/admin/user/:id"
          element={<UserDetailManagement />}
        ></Route>
        <Route path="/admin/dashboard" element={<AdminDashboard />}></Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
