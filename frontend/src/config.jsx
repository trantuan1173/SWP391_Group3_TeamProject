// API Configuration
const baseUrl = "https://swp.gicunhco.com";

export const API_ENDPOINTS = {
  //Đây là ví dụ khai báo url để import vào các component

  // USER_UPDATE_PROFILE: (userId) => `${baseUrl}/api/users/${userId}`,
  // GET_ALL_ROLE: `${baseUrl}/api/roles`,
  EMP_LOGIN: `${baseUrl}/api/employees/login`,
  PATIENT_LOGIN: `${baseUrl}/api/patients/login`,
  REGISTER: `${baseUrl}/api/patients/register`,
  AUTH_PROFILE: `${baseUrl}/api/users/profile`,
  VERIFY: `${baseUrl}/api/patients/verify`,
  RESEND_VERIFY_EMAIL: `${baseUrl}/api/patients/resend-verify-email`,
  FORGOT_PASSWORD: `${baseUrl}/api/patients/forgot-password`,
  RESET_PASSWORD: `${baseUrl}/api/patients/reset-password`,
  DOCTOR_LIST: `${baseUrl}/api/doctors`,
  // GET_DOCTOR_SCHEDULE: (doctorId) =>
  //   `${baseUrl}/api/doctors/${doctorId}/schedule`,
  SPECIALITY_LIST: `${baseUrl}/api/doctors/specialties`,
  USER_LIST: `${baseUrl}/api/users`,
  GET_ALL_USERS: `${baseUrl}/api/admin/employees`,
  GET_USER_BY_ID: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  DELETE_USER: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  UPDATE_USER: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  CREATE_USER: `${baseUrl}/api/admin/create-employee`,
  GET_ALL_PATIENTS: `${baseUrl}/api/admin/patients`,
  //roles
  GET_ROLES: `${baseUrl}/api/admin/roles`,
  GET_ROLE_BY_ID: (roleId) => `${baseUrl}/api/admin/roles/${roleId}`,
  CREATE_ROLE: `${baseUrl}/api/admin/create-role`,
  UPDATE_ROLE: (roleId) => `${baseUrl}/api/admin/roles/${roleId}`,
  DELETE_ROLE: (roleId) => `${baseUrl}/api/admin/roles/${roleId}`,
  //patients
  ADMIN_GET_ALL_PATIENTS: `${baseUrl}/api/admin/patients/get-all`,
  GET_PATIENT_BY_ID: (id) => `${baseUrl}/api/admin/patients/${id}`,
  CREATE_PATIENT: `${baseUrl}/api/admin/patients`,
  UPDATE_PATIENT: (id) => `${baseUrl}/api/admin/patients/${id}`,
  DELETE_PATIENT: (id) => `${baseUrl}/api/admin/patients/${id}`,
  //admin dashboard
  GET_TOTAL_PATIENTS: `${baseUrl}/api/admin/dashboard/total-patients`,
  GET_ACTIVE_PATIENTS: `${baseUrl}/api/admin/dashboard/active-patients`,
  GET_TOTAL_EMPLOYEES: `${baseUrl}/api/admin/dashboard/total-employees`,
  GET_AVAILABLE_ROLES: `${baseUrl}/api/admin/dashboard/available-roles`,
  GET_RECENT_PATIENTS: `${baseUrl}/api/admin/dashboard/recent-patients`,
  GET_RECENT_EMPLOYEES: `${baseUrl}/api/admin/dashboard/recent-employees`,
  //services
  ADMIN_GET_ALL_SERVICES: `${baseUrl}/api/admin/services`,
  ADMIN_GET_ALL_SERVICES_PAGINATION: `${baseUrl}/api/services/get-all`,
  GET_SERVICE_BY_ID: (id) => `${baseUrl}/api/services/${id}`,
  CREATE_SERVICE: `${baseUrl}/api/services`,
  UPDATE_SERVICE: (id) => `${baseUrl}/api/services/${id}`,
  DELETE_SERVICE: (id) => `${baseUrl}/api/services/${id}`,
  //appointments
  CREATE_APPOINTMENT: `${baseUrl}/api/patients/appointments/create`,
  CREATE_APPOINTMENT_WITHOUT_LOGIN: `${baseUrl}/api/patients/appointmentsWithoutLogin`,
  CONFIRM_APPOINTMENT: `${baseUrl}/api/patients/confirmAppointment`,
  GET_MEDICAL_RECORDS_BY_DOCTOR: (doctorId, patientId = null) =>
    `${baseUrl}/api/medical-records/doctor/${doctorId}${
      patientId ? `?patientId=${patientId}` : ""
    }`,
  //GET_ALL_PATIENTS: `${baseUrl}/api/medical-records/patients`,

  //GET_MEDICAL_RECORDS_BY_PATIENT: (patientId) => `${baseUrl}/api/medical-records/patient/${patientId}`,
  GET_DOCTOR_SCHEDULE: (doctorId) => `${baseUrl}/api/doctor-schedules/${doctorId}`,
  GET_PATIENTS_BY_DOCTOR: (doctorId) =>
    `${baseUrl}/api/medical-records/doctor/${doctorId}/patients`,
  GET_PATIENT_BY_DOCTOR: (doctorId) =>
    `${baseUrl}/api/medical-records/doctor/${doctorId}/patient`,
  GET_EMPLOYEE_WITH_ROLE: (employeeId) =>
    `${baseUrl}/api/employees/${employeeId}/with-role`,
  GET_APPOINTMENTS_BY_PATIENT: (patientId) =>
    `${baseUrl}/api/appointments/patient/${patientId}`,
  APPOINTMENT_BY_ID: (appointmentId) =>
    `${baseUrl}/api/appointments/${appointmentId}`,
  PATIENT_BY_ID: (patientId) => `${baseUrl}/api/patients/${patientId}`,
  GET_ALL_APPOINTMENTS: `${baseUrl}/api/appointments`,
  GET_APPOINTMENT_BY_ID: (appointmentId) =>
    `${baseUrl}/api/appointments/${appointmentId}`,
  UPDATE_APPOINTMENT: (appointmentId) =>
    `${baseUrl}/api/appointments/${appointmentId}`,
  GET_TODAY_APPOINTMENTS: `${baseUrl}/api/appointments/today`,
  GET_APPOINTMENT_DASHBOARD: `${baseUrl}/api/appointments/dashboard`,
  CREATE_NEWS: `${baseUrl}/api/news`,
  UPDATE_NEWS: (newsId) => `${baseUrl}/api/news/${newsId}`,
  DELETE_NEWS: (newsId) => `${baseUrl}/api/news/${newsId}`,
  GET_NEWS: `${baseUrl}/api/news`,
  GET_NEWS_BY_ID: (newsId) => `${baseUrl}/api/news/${newsId}`,
  GET_SERVICES: `${baseUrl}/api/services`,
  CREATE_MEDICAL_RECORD: `${baseUrl}/api/medical-records`,
  GET_AVAILABLE_DOCTORS: `${baseUrl}/api/appointments/available-doctors`,
  GET_AVAILABLE_ROOMS: `${baseUrl}/api/appointments/available-rooms`,

  //payment
  PAYOS_WEBHOOK: `${baseUrl}/api/payments/webhook`,
  DELETE_PAYMENT: `${baseUrl}/api/payments/delete`,

  GET_ALL_PATIENTS_FOR_RECEPTIONIST: `${baseUrl}/api/patients/getpatients`,
  ROOM_LIST: `${baseUrl}/api/employees/rooms`,
  GET_DOCTOR_FEEDBACKS: (doctorId) => `${baseUrl}/api/doctors/${doctorId}/feedbacks`,
  GET_DOCTOR_BY_ID: (doctorId) => `${baseUrl}/api/doctors/${doctorId}`,
  GET_REVENUE_SUMMARY: `${baseUrl}/api/admin/revenue/summary`,
  GET_REVENUE_TIMESERIES: `${baseUrl}/api/admin/revenue/timeseries`,
  GET_REVENUE_BY_METHOD: `${baseUrl}/api/admin/revenue/by-method`,

  FETCH_FAQ_CATEGORY_SUMMARY: `${baseUrl}/api/faq/categories/summary`,

  FAQ_LIST: `${baseUrl}/api/faq`,
  FAQ_DETAIL: (id) => `${baseUrl}/api/faq/get-faq/${id}`,
  CREATE_FAQ: `${baseUrl}/api/faq/create`,
  UPDATE_FAQ: (id) => `${baseUrl}/api/faq/${id}`,
  DELETE_FAQ: (id) => `${baseUrl}/api/faq/delete/${id}`,

  // ===== Tickets =====
  TICKET_LIST: `${baseUrl}/api/tickets`,
  TICKET_DETAIL: (id) => `${baseUrl}/api/tickets/get-ticket/${id}`,
  TICKET_CREATE: `${baseUrl}/api/tickets/create`,
  TICKET_UPDATE_STATUS: (id) => `${baseUrl}/api/tickets/${id}/status`,
  TICKET_ANSWER: (id) => `${baseUrl}/api/tickets/${id}/answer`,
  TICKET_DELETE: (id) => `${baseUrl}/api/tickets/delete/${id}`,

  ADMIN_TICKET_LIST: `${baseUrl}/api/tickets/receptionist/list-tickets`,
  ADMIN_TICKET_STATUS: (id) => `${baseUrl}/api/tickets/${id}/status`,
  ADMIN_TICKET_ANSWER: (id) => `${baseUrl}/api/tickets/${id}/answer`,
  ADMIN_TICKET_DELETE: (id) => `${baseUrl}/api/tickets/delete/${id}`,

  GET_POLICIES: `${baseUrl}/api/policies`,
  CREATE_POLICY: `${baseUrl}/api/policies`,
  UPDATE_POLICY: (id) => `${baseUrl}/api/policies/${id}`,
  DELETE_POLICY: (id) => `${baseUrl}/api/policies/${id}`,
  GET_POLICY: (id) => `${baseUrl}/api/policies/${id}`,
  GET_ACTIVE_POLICY_BY_CATEGORY: (category) =>
    `${baseUrl}/api/policies/category/${category}`,

  MEDICINE_LIST: `${baseUrl}/api/medicines`, // GET ?page=&pageSize=&search=
  MEDICINE_DETAIL: (id) => `${baseUrl}/api/medicines/${id}`, // GET 1 thuốc
  CREATE_MEDICINE: `${baseUrl}/api/medicines/create`, // POST
  UPDATE_MEDICINE: (id) => `${baseUrl}/api/medicines/update/${id}`, // PUT
  DELETE_MEDICINE: (id) => `${baseUrl}/api/medicines/delete/${id}`, // DELETE
  MEDICINE_EXPIRING_SOON: `${baseUrl}/api/medicines/expiring/soon`, // GET
  CHANGE_PASSWORD: `${baseUrl}/api/users/change-password`,
  GET_MEDICINES: `${baseUrl}/api/medicines`,
};
