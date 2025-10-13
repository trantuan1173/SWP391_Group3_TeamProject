import axios from 'axios';
import { API_ENDPOINTS } from '../config';

const instance = axios.create({
  baseURL: '',
  // you can set common config here
});

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

export default instance;
