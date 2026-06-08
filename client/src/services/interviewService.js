import API from './api.js';

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const getResume = async () => {
  const res = await API.get('/resume');
  return res.data.data;
};

export const startInterview = async (payload) => {
  const res = await API.post('/interview/start', payload);
  return res.data.data;
};

export const submitTextAnswer = async (interviewId, answer) => {
  const res = await API.post(`/interview/${interviewId}/answer`, { answer });
  return res.data.data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'answer.webm');
  const res = await API.post('/interview/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.text;
};

export const submitCode = async (interviewId, code, language, questionText) => {
  const res = await API.post(`/interview/${interviewId}/code`, { code, language, questionText });
  return res.data.data;
};

export const endInterview = async (interviewId) => {
  const res = await API.post(`/interview/${interviewId}/end`);
  return res.data.data;
};

export const getInterview = async (interviewId) => {
  const res = await API.get(`/interview/${interviewId}`);
  return res.data.data;
};
