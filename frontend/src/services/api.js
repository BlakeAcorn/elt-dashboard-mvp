import axios from 'axios';

// Dynamically determine API URL based on current host
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // If we're on ngrok, use the ngrok backend URL
  if (window.location.hostname.includes('ngrok')) {
    return 'https://66718899b887.ngrok-free.app/api';
  }
  
  // Default to localhost for local development
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for blob downloads (without response interceptor)
const blobApi = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      console.warn('API rate limit reached. Please wait a moment before retrying.');
      // Don't throw error for 429, return a friendly response instead
      return {
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        retryAfter: error.response?.headers['retry-after'] || 5
      };
    }
    return Promise.reject(error);
  }
);

// File upload service
export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFiles: async () => {
    return api.get('/upload/files');
  },

  deleteFile: async (fileId) => {
    return api.delete(`/upload/file/${fileId}`);
  },

  downloadTemplate: async (format = 'csv') => {
    const response = await blobApi.get(`/upload/template/${format}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `elt-data-template.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Data service
export const dataService = {
  getQuarterlyData: async (params = {}) => {
    return api.get('/data/quarterly', { params });
  },

  getComparisonData: async (quarters = []) => {
    const params = quarters.length > 0 ? { quarters: quarters.join(',') } : {};
    return api.get('/data/comparison', { params });
  },


  getMetricsByCategory: async (category, params = {}) => {
    return api.get(`/data/metrics/${category}`, { params });
  },

  getSummary: async () => {
    return api.get('/data/summary');
  },

  getTrendAnalysis: async (metricName) => {
    return api.get(`/data/trend/${metricName}`);
  },

  saveDashboardConfig: async (configName, configData) => {
    return api.post('/data/config', { configName, configData });
  },

  getDashboardConfig: async (configName) => {
    return api.get(`/data/config/${configName}`);
  },

  // Historical data methods
  getHistoricalData: async (metricName = null, params = {}) => {
    if (metricName) {
      return api.get(`/data/historical/${metricName}`, { params });
    }
    return api.get('/data/historical', { params });
  },

  getQuarterOverQuarterComparison: async (metricName, quarter, year) => {
    return api.get(`/data/qoq/${metricName}`, { 
      params: { quarter, year } 
    });
  },

  getMetricsByQuarter: async (quarter, year) => {
    return api.get(`/data/quarter/${quarter}/${year}`);
  },

  getAvailableQuarters: async () => {
    return api.get('/data/quarters/available');
  },

  getTrendData: async (metricName, quarters = 8) => {
    return api.get(`/data/trend-data/${metricName}`, { 
      params: { quarters } 
    });
  },
};

// Health check
export const healthService = {
  check: async () => {
    return api.get('/health');
  },
};

export default api;
