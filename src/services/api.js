import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPDFs = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('pdfs', file));
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getLibrary = async () => {
  return api.get('/library');
};

export const process1A = async (fileId) => {
  return api.get(`/process-1a/${fileId}`);
};

export const process1B = async (fileIds, persona, objective) => {
  return api.post('/process-1b', {
    file_ids: fileIds,
    persona,
    objective
  });
};

export const generateInsights = async (content) => {
  return api.post('/insights', { content });
};

export const generatePodcast = async (content, insights) => {
  return api.post('/podcast', {
    content,
    insights
  }, {
    responseType: 'blob'
  });
};

export const searchPDFs = async (query, fileIds) => {
  return api.post('/search', {
    query,
    file_ids: fileIds
  });
};

export const searchRelatedWithInsights = async (selectedText, fileIds) => {
  return api.post('/search-related', {
    selected_text: selectedText,
    file_ids: fileIds
  });
};

export const generateAudio = async (text) => {
  return api.post('/generate-audio', { text });
};

export const getAvailableVoices = async () => {
  return api.get('/tts/voices');
};

export const configureTTS = async (voice, speakingRate) => {
  return api.post('/tts/configure', { voice, speaking_rate: speakingRate });
};

export default api;
