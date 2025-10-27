import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const fetchPatients = async (page = 1, pageSize = 10, search = "") => {
  const res = await axios.get(API_ENDPOINTS.ADMIN_GET_ALL_PATIENTS, {
    params: { page, pageSize, search },
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchPatientById = async (id) => {
  const res = await axios.get(API_ENDPOINTS.GET_PATIENT_BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const createPatient = async (data) => {
  const res = await axios.post(API_ENDPOINTS.CREATE_PATIENT, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const updatePatient = async (id, data) => {
  const res = await axios.put(API_ENDPOINTS.UPDATE_PATIENT(id), data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const deletePatient = async (id) => {
  return axios.delete(API_ENDPOINTS.DELETE_PATIENT(id), {
    headers: getAuthHeaders(),
  });
};

export const updatePatientStatus = async (id, isActive) => {
  const res = await axios.put(
    `http://localhost:1118/api/admin/patients/update-status/${id}`,
    { isActive },
    {
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("token") || sessionStorage.getItem("token")
        }`,
      },
    }
  );
  return res.data;
};
