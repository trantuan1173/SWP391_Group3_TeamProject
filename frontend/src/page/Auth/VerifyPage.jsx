import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {API_ENDPOINTS} from "../../config";
import { useNavigate } from "react-router-dom";

const VerifyPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Đang xác minh...");
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: email,
    otp: ''
  })

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called with formData:", formData);
    try {
      const res = await axios.post(API_ENDPOINTS.VERIFY, formData);
      setMessage(res.data.message || "Xác minh thành công!");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      setError("");
    } catch (err) {
      setMessage("Xác minh thất bại hoặc token không hợp lệ. Vui lòng nhập email để gửi lại mã xác minh");
      setError(true);
    }
  };


  const handleResendVerifyEmail = async (e) => {
    e.preventDefault();
    console.log("handleResendVerifyEmail called with email:", email);
    try {
      const res = await axios.post(API_ENDPOINTS.RESEND_VERIFY_EMAIL, { email });
      setMessage(res.data.message || "Mã xác minh đã được gửi lại!");
    } catch (err) {
      setMessage("Gửi thất bại. Vui lòng thử lại.");
      setError(err.response.data.message);
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
        <div className="bg-[#FFDEC8] rounded-2xl shadow-lg w-3/4 p-10">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Verify your account</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">OTP</label>
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border border-black rounded-full focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              type="submit"
              className="w-full py-2 rounded bg-[#6FA549] text-white font-medium hover:bg-green-700 transition border border-[#000000]"
            >
              Verify
            </button>

            <button
              onClick={handleResendVerifyEmail}
              className="w-full mt-4 py-2 rounded bg-[#6FA549] text-white font-medium hover:bg-green-700 transition border border-[#000000]"
              type="button"
            >
              Resend OTP
            </button>

            {message && (
              <p className={`mt-4 text-center ${error ? "text-red-600" : "text-green-600"}`}>
                {message}
              </p>
            )}

          </form>
        </div>
      </div>
    </div>

  );
};

export default VerifyPage;
