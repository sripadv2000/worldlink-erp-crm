// Cloud Run and production-ready configuration
const isProduction = import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE === 'remote';

// Get backend URL from environment or fallback to localhost for development
const getBackendUrl = () => {
  if (isProduction) {
    // In production, VITE_BACKEND_SERVER must be set
    const backendUrl = import.meta.env.VITE_BACKEND_SERVER;
    if (!backendUrl) {
      console.warn('VITE_BACKEND_SERVER not set in production. API calls may fail.');
    }
    return backendUrl || '';
  }
  return 'http://localhost:8888/';
};

const BACKEND_BASE = getBackendUrl();

export const API_BASE_URL = BACKEND_BASE + (BACKEND_BASE.endsWith('/') ? 'api/' : '/api/');
export const BASE_URL = BACKEND_BASE;

// Get frontend URL from environment or use window.location.origin
export const WEBSITE_URL = import.meta.env.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin + '/' : 'http://localhost:3000/');

export const DOWNLOAD_BASE_URL = BACKEND_BASE + (BACKEND_BASE.endsWith('/') ? 'download/' : '/download/');
export const ACCESS_TOKEN_NAME = 'x-auth-token';

// File base URL with fallback to backend URL
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || BACKEND_BASE;

//  console.log(
//    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
//  );
