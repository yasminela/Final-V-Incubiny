import axios from 'axios';

// Ajouter /api à l'URL de base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Call:', config.method.toUpperCase(), config.baseURL + config.url);
  return config;
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    if (error.response?.status === 404) {
      console.error('Vérifiez que le backend tourne sur http://localhost:5001');
    }
    return Promise.reject(error);
  }
);

export default api;