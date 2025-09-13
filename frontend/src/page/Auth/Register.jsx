import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: '',
    identityNumber: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
  });

  const [errors, setErrors] = useState({ confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_ENDPOINTS.REGISTER}`, formData);
      if (response.status === 201) setShowVerifyMsg(true);
      navigate(`/verify?email=${formData.email}`);
    } catch {
      alert('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner size={120} text="Registering..." />;

  return (
    <div className="min-h-screen flex bg-[#00A646]">
      {/* Left side */}
      <div className="w-1/2 bg-[#00A646] flex flex-col items-center justify-center text-white">
        <img src="/icon/logo.png" alt="Logo" className="w-64 mb-6" />
        <h1 className="text-2xl font-semibold">Clinic Patient's Dashboard</h1>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="bg-[#FFDEC8] rounded-2xl shadow-lg w-3/4 p-10">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Welcome</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E- Mail</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
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
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Identify Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="identityNumber"
                  required
                  value={formData.identityNumber || ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="relative">
                <input
                  type="text"
                  name="gender"
                  required
                  value={formData.gender || ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <div className="relative">
                <input
                  type="text"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth || ""}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded bg-[#6FA549] text-white font-medium hover:bg-green-700 transition border border-[#000000]"
            >
              Register
            </button>

            <div className="text-center text-sm text-gray-700">
              If You Didn't Have Account{" "}
              <span
                className="text-blue-600 hover:underline cursor-pointer font-semibold"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
