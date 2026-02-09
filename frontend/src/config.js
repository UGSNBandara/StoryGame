// API Configuration
const getApiUrl = () => {
  // In development (localhost), use localhost backend
  // In production (deployed), use same host with port 8000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return `http://${window.location.hostname}:8000`;
};

export const API_URL = getApiUrl();
