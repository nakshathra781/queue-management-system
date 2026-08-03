const API_BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('queueflow_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth API
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Services API
  async getServices() {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // Queue API
  async getQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/queue${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  async getMyTokens() {
    const response = await fetch(`${API_BASE_URL}/queue/my`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  async createToken(payload) {
    const response = await fetch(`${API_BASE_URL}/queue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  async callToken(tokenId, counterNumber) {
    const response = await fetch(`${API_BASE_URL}/queue/${tokenId}/call`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ counterNumber })
    });
    return handleResponse(response);
  },

  async completeToken(tokenId) {
    const response = await fetch(`${API_BASE_URL}/queue/${tokenId}/complete`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  async skipToken(tokenId) {
    const response = await fetch(`${API_BASE_URL}/queue/${tokenId}/skip`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/queue/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};
