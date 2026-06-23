import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const login = async (credentials: any) => {
  const res = await api.post('/auth/login', credentials);
  return res.data;
};

export const getStats = async () => {
  const res = await api.get('/employees/stats');
  return res.data;
};

export const getDistributionByDepartment = async () => {
  const res = await api.get('/employees/distribution/department');
  return res.data;
};

export const getDistributionByCountry = async () => {
  const res = await api.get('/employees/distribution/country');
  return res.data;
};

export const getEmployees = async (params: any) => {
  const res = await api.get('/employees', { params });
  return res.data;
};

export const addUser = async (data: any) => {
  const res = await api.post('/employees', data);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

export const updateRole = async (id: number, role: string) => {
  const res = await api.put(`/employees/${id}/role`, { role });
  return res.data;
};

export const createPayslip = async (data: any) => {
  const res = await api.post('/payslips', data);
  return res.data;
};

export const getPayslips = async (employee_id?: number) => {
  const params = employee_id ? { employee_id } : {};
  const res = await api.get('/payslips', { params });
  return res.data;
};
