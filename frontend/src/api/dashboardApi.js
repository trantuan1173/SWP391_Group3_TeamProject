import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const fetchTotalPatients = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_TOTAL_PATIENTS, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchActivePatients = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_ACTIVE_PATIENTS, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchTotalEmployees = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_TOTAL_EMPLOYEES, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchAvailableRoles = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_AVAILABLE_ROLES, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchRecentPatients = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_RECENT_PATIENTS);
  return res.data.patients;
};

export const fetchRecentEmployees = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_RECENT_EMPLOYEES);
  return res.data.employees;
};
