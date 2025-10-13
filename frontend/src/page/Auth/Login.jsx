import React, { useState } from "react";
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isPatient, setIsPatient] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setErrorMessage(""); 

    //     try {
    //         const endpoint = isPatient ? API_ENDPOINTS.PATIENT_LOGIN : API_ENDPOINTS.EMP_LOGIN;
    //         const response = await axios.post(endpoint, form);

    //         if (response.status === 200) {
    //             const { token } = response.data;
    //             console.log(response.data)
    //             localStorage.setItem('token', token);
    //             navigate("/"); 
    //         }
    //     } catch (error) {
    //         if (error.response) {
    //             const status = error.response.status;
    //             const message = error.response.data.message || "Đăng nhập thất bại";

    //             if (status === 401 || status === 403) {
    //                 setErrorMessage(message); 
    //             } else {
    //                 setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại."); 
    //             }
    //         } else {
    //             setErrorMessage("Không thể kết nối đến máy chủ."); 
    //         }
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMessage(""); 
  
      try {
          const endpoint = isPatient ? API_ENDPOINTS.PATIENT_LOGIN : API_ENDPOINTS.EMP_LOGIN;
          const response = await axios.post(endpoint, form);
  
          if (response.status === 200) {
              const { token, employee, patient } = response.data;
              localStorage.setItem('token', token);
  
              setUser(isPatient ? patient : employee);
  
              // Redirect
              if (isPatient) {
                  navigate("/patient-dashboard");
              } else if (employee && employee.roles && employee.roles.length > 0) {
                  const roleName = employee.roles[0].name.toLowerCase();
                  switch (roleName) {
                      case "doctor":
                          navigate("/doctor/schedule");
                          break;
                      case "receptionist":
                          navigate("receptionist");
                          break;
                      case "admin":
                          navigate("/admin/user");
                          break;
                      default:
                          navigate("/");
                  }
              } else {
                  navigate("/");
              }
          }
      } catch (error) {
          if (error.response) {
              const status = error.response.status;
              const message = error.response.data.message || "Đăng nhập thất bại";
  
              if (status === 401 || status === 403) {
                  setErrorMessage(message); 
              } else {
                  setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại."); 
              }
          } else {
              setErrorMessage("Không thể kết nối đến máy chủ."); 
          }
      } finally {
          setIsLoading(false);
      }
  };

    return (
      <div className="min-h-screen flex bg-[#00A646]">
        {/* Left side */}
        <div className="w-1/2 bg-[#00A646] flex flex-col items-center justify-center text-white">
          <img src="/icon/logo.png" alt="Logo" className="w-64 mb-6" />
          <h1 className="text-2xl font-semibold">Clinic Patient's Dashboard</h1>
        </div>

        {/* Right side */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="bg-[#FFDEC8] rounded-2xl shadow-lg w-3/4 p-10 min-h-[350px]">
            <h2 className="text-4xl font-bold text-gray-800 text-center">Welcome Back</h2>

            {/* Toggle giữa bệnh nhân và nhân viên */}
            <div className="flex justify-center mt-4 mb-6 space-x-4">
              <button
                type="button"
                onClick={() => setIsPatient(false)}
                className={`px-4 py-2 rounded-full font-medium ${
                  !isPatient ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setIsPatient(true)}
                className={`px-4 py-2 rounded-full font-medium ${
                  isPatient ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'
                }`}
              >
                Patient
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">E- Mail</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="text-red-600 font-semibold text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded bg-[#6FA549] text-white font-medium hover:bg-green-700 transition border border-[#000000]"
              >
                Log-In
              </button>

              <div className="text-center text-sm text-gray-700">
                If You Didn't Have Account{" "}
                <span
                  className="text-blue-600 hover:underline cursor-pointer font-semibold"
                  onClick={() => navigate("/register")}
                >
                  Sign-Up
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
}