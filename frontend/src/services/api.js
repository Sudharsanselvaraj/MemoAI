import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processAudio = async (audioBlob, sessionId = 'default') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');
  formData.append('session_id', sessionId);
  
  const response = await api.post('/api/process_audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const processText = async (text, sessionId = 'default') => {
  const response = await api.post('/api/process_text', {
    text,
    session_id: sessionId,
  });
  return response.data;
};

export const approveAction = async (sessionId = 'default') => {
  const response = await api.post('/api/approve', {
    session_id: sessionId,
  });
  return response.data;
};

export const getHistory = async (sessionId = 'default') => {
  const response = await api.get(`/api/history?session_id=${sessionId}`);
  return response.data;
};

export default {
  processAudio,
  processText,
  approveAction,
  getHistory,
};
