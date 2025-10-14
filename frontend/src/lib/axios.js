import axios from 'axios';
import { API_ENDPOINTS } from '../config';

// Infer baseURL from API_ENDPOINTS (use PATIENT_LOGIN origin as canonical API root)
let baseURL = '';
try {
  if (API_ENDPOINTS && API_ENDPOINTS.PATIENT_LOGIN) {
    baseURL = new URL(API_ENDPOINTS.PATIENT_LOGIN).origin;
  }
} catch (e) {
  baseURL = '';
}

const instance = axios.create({ baseURL });

// Attach token from localStorage automatically
instance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('token', token);
      instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete instance.defaults.headers.common.Authorization;
    }
  } catch (e) {}
}

export function clearAuthToken() {
  try {
    localStorage.removeItem('token');
    delete instance.defaults.headers.common.Authorization;
  } catch (e) {}
}

export default instance;
