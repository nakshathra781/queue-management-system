const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token =
    localStorage.getItem("queueflow_token") ||
    localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const api = {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse(response);
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  async getServices() {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  async getQueue() {
    const response = await fetch(`${API_BASE_URL}/tokens/queue`, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  async getMyTokens() {
    const response = await fetch(`${API_BASE_URL}/tokens/my-tokens`, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  async createToken(payload) {
    const response = await fetch(`${API_BASE_URL}/tokens`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },

  async updateTokenStatus(tokenId, status) {
    const response = await fetch(`${API_BASE_URL}/tokens/${tokenId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    return handleResponse(response);
  },

  async callToken(tokenId) {
    return this.updateTokenStatus(tokenId, "called");
  },

  async completeToken(tokenId) {
    return this.updateTokenStatus(tokenId, "completed");
  },

  async skipToken(tokenId) {
    return this.updateTokenStatus(tokenId, "skipped");
  },
};