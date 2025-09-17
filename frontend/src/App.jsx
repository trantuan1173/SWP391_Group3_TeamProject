import { AuthProvider } from './context/AuthContext'
import { Routes, Route } from 'react-router-dom'
import Login from './page/Auth/Login'
import Register from './page/Auth/Register'
import VerifyPage from './page/Auth/VerifyPage'
import BookMedicalExam from "./page/guest/BookMedicalExam";
import ListDoctor from "./page/doctor/ListDoctor";

function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/book" element={<BookMedicalExam />} />
        <Route path="/doctor" element={<ListDoctor />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
