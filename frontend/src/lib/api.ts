import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

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
