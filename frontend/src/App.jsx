import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import Login from "./page/Auth/Login";
import Register from "./page/Auth/Register";
import VerifyPage from "./page/Auth/VerifyPage";
import UserManagement from "./page/AdminUserManager/UserManagement";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/admin/user" element={<UserManagement />}></Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
