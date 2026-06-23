import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Do not attempt to refresh if the error is from the login or refresh endpoints itself
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken } = res.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

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

export const getEmployeeById = async (id: number) => {
  const res = await api.get(`/employees/${id}`);
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

export const editUser = async (id: number, data: any) => {
  const res = await api.put(`/employees/${id}`, data);
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

export const updatePayslip = async (id: number, data: any) => {
  const res = await api.put(`/payslips/${id}`, data);
  return res.data;
};

export const deletePayslip = async (id: number) => {
  const res = await api.delete(`/payslips/${id}`);
  return res.data;
};
