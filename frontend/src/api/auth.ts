import axiosInstance from './axiosInstance';

export const login = async (email: string, password: string) => {
  const { data } = await axiosInstance.post('/auth/login', { email, password });
  return data;
};

export const logout = async () => {
  const { data } = await axiosInstance.post('/auth/logout');
  return data;
};

export const verifySession = async (): Promise<boolean> => {
  try {
    const { data } = await axiosInstance.get('/auth/verify');
    return data.authenticated === true;
  } catch {
    return false;
  }
};
