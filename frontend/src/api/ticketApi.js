import { API_ENDPOINTS } from "@/config";
import axios from "axios";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const createTicket = async (payload) => {
  try {
    const res = await axios.post(API_ENDPOINTS.TICKET_CREATE, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("createTicket error:", err);
    throw err;
  }
};

export const fetchTickets = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  userId,
} = {}) => {
  try {
    const params = { page, pageSize, search, status };
    if (userId) params.userId = userId;

    const res = await axios.get(API_ENDPOINTS.TICKET_LIST, {
      params,
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("fetchTickets error:", err);
    throw err;
  }
};

export const fetchTicketsAdmin = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  userId,
} = {}) => {
  const params = { page, pageSize, search, status };
  if (userId) params.userId = userId;
  const res = await axios.get(API_ENDPOINTS.ADMIN_TICKET_LIST, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchTicketById = async (id) => {
  try {
    const res = await axios.get(API_ENDPOINTS.TICKET_DETAIL(id), {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("fetchTicketById error:", err);
    throw err;
  }
};

export const updateTicketStatus = async (id, status) => {
  try {
    const res = await axios.patch(
      API_ENDPOINTS.TICKET_UPDATE_STATUS(id),
      { status },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("updateTicketStatus error:", err);
    throw err;
  }
};

export const answerTicket = async (id, answer, nextStatus) => {
  try {
    const body = nextStatus ? { answer, status: nextStatus } : { answer };
    const res = await axios.post(API_ENDPOINTS.TICKET_ANSWER(id), body, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("answerTicket error:", err);
    throw err;
  }
};

export const deleteTicket = async (id) => {
  try {
    const res = await axios.delete(API_ENDPOINTS.TICKET_DELETE(id), {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("deleteTicket error:", err);
    throw err;
  }
};
