import API from './api.js';

export const getHistory = async (page = 1, limit = 10) => {
  const res = await API.get(`/history?page=${page}&limit=${limit}`);
  return res.data.data;
};

export const deleteHistoryItem = async (id) => {
  const res = await API.delete(`/history/${id}`);
  return res.data;
};

export const clearHistory = async () => {
  const res = await API.delete('/history/clear');
  return res.data;
};
