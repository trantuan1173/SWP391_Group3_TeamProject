import { AuthProvider } from './context/AuthContext'
import { Routes, Route } from 'react-router-dom'
import Login from './page/Auth/Login'
import Register from './page/Auth/Register'
import VerifyPage from './page/Auth/VerifyPage'
import PatientDashboard from './page/Patient/PatientDashboard'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />

        {/* Patient Dashboard routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-dashboard/:id" element={<PatientDashboard />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
