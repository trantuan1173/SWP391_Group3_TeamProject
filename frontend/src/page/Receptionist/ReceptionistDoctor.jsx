import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config";
import { LoaderCircle } from "lucide-react";

export default function ReceptionistDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [specialityFilter, setSpecialityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINTS.DOCTOR_LIST, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setDoctors(res.data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors =
    specialityFilter === "all"
      ? doctors
      : doctors.filter((doctor) => doctor.speciality === specialityFilter);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-700">
          Doctor List
        </h1>
      </div>

      <div className="mb-4 flex items-center">
        <label htmlFor="specialityFilter" className="mr-2 font-medium text-gray-700">
          Chuyên khoa:
        </label>
        <select
          id="specialityFilter"
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={specialityFilter}
          onChange={(e) => setSpecialityFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="Nội khoa">Nội khoa</option>
          <option value="Ngoại khoa">Ngoại khoa</option>
          <option value="Sản - Nhi">Sản - Nhi</option>
          <option value="Da liễu - Thẩm mỹ">Da liễu - Thẩm mỹ</option>
          <option value="Tâm lý - Tâm thần">Tâm lý - Tâm thần</option>
          <option value="Y học cổ truyền">Y học cổ truyền</option>
          <option value="Hồi phục chức năng">Hồi phục chức năng</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="animate-spin text-blue-600 w-12 h-12" />
        </div>
      ) : (
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left border-b">No.</th>
              <th className="p-3 text-left border-b">Avatar</th>
              <th className="p-3 text-left border-b">Name</th>
              <th className="p-3 text-left border-b">Phone</th>
              <th className="p-3 text-left border-b">Chuyên khoa</th>
              <th className="p-3 text-left border-b">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor, index) => (
                <tr
                  key={doctor.id}
                  className="hover:bg-gray-50 border-b transition-colors"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {doctor.name}
                  </td>
                  <td className="p-3">{doctor.phoneNumber}</td>
                  <td className="p-3">{doctor.speciality}</td>
                  <td
                    className={`p-3 font-medium ${doctor.isActive ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {doctor.isActive ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}