import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const fetchRevenueSummary = async (params = {}) => {
  const res = await axios.get(API_ENDPOINTS.GET_REVENUE_SUMMARY, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchRevenueTimeseries = async (params = {}) => {
  const res = await axios.get(API_ENDPOINTS.GET_REVENUE_TIMESERIES, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};
export const fetchRevenueByMethod = async (params = {}) => {
  const res = await axios.get(API_ENDPOINTS.GET_REVENUE_BY_METHOD, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};
