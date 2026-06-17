const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
  }
}

function formatValidationMessage(message: string, errors?: Record<string, string[]>): string {
  if (!errors || Object.keys(errors).length === 0) return message;

  return Object.entries(errors)
    .map(([field, messages]) => {
      const label = field.replace(/^body\./, '').replace(/([A-Z])/g, ' $1');
      return `${label}: ${messages.join(', ')}`;
    })
    .join('\n');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('krushi_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(
      res.status,
      formatValidationMessage(body.message || body.error || 'Request failed', body.errors),
      body.errors
    );
  }

  const body = await res.json();
  return body.data !== undefined ? body.data : body;
}

// Auth API
export const auth = {
  login: (phone: string, password: string) =>
    request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  register: (data: { phone: string; email?: string; password: string; firstName: string; lastName?: string; role: string; district?: string; taluka?: string; village?: string; languagePref?: string }) =>
    request<{ user: any; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  refreshToken: (refreshToken?: string) =>
    request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getMe: () =>
    request<any>('/auth/me'),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, otp: string, password: string) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password }),
    }),

  verifyEmail: (email: string, otp: string) =>
    request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  sendOtp: (email: string, purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'PHONE_VERIFICATION') =>
    request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),
};

// Users API
export const users = {
  getAll: (params?: Record<string, string>) =>
    request<any[]>(`/users${params ? '?' + new URLSearchParams(params) : ''}`),
  getById: (id: string) => request<any>(`/users/${id}`),
  update: (id: string, data: any) =>
    request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/users/${id}`, { method: 'DELETE' }),
};

// Jobs API
export const jobs = {
  getAll: (params?: Record<string, string>) =>
    request<any[]>(`/jobs${params ? '?' + new URLSearchParams(params) : ''}`),
  getById: (id: string) => request<any>(`/jobs/${id}`),
  create: (data: any) =>
    request<any>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/jobs/${id}`, { method: 'DELETE' }),
  apply: (jobId: string, coverLetter?: string) =>
    request<any>(`/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify({ coverLetter }) }),
  getApplications: (jobId: string) =>
    request<any[]>(`/jobs/${jobId}/applications`),
  updateApplication: (applicationId: string, status: string) =>
    request<any>(`/jobs/applications/${applicationId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Payments API
export const payments = {
  createOrder: (data: { amount: number; currency?: string; description?: string }) =>
    request<any>('/payments/create-order', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    request<any>('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => request<any[]>('/payments'),
  getById: (id: string) => request<any>(`/payments/${id}`),
};

// Subscriptions API
export const subscriptions = {
  getPlans: () => request<any[]>('/subscriptions/plans'),
  create: (planId: string) =>
    request<any>('/subscriptions', { method: 'POST', body: JSON.stringify({ planId }) }),
  getMySubscription: () => request<any>('/subscriptions/my'),
  cancel: (id: string) =>
    request<any>(`/subscriptions/${id}/cancel`, { method: 'POST' }),
};

// IVR API
export const ivr = {
  request: (data: { jobId?: string; targetTaluka?: string; targetNumber?: string; workerType?: string; message?: string }) =>
    request<any>('/ivr/request', { method: 'POST', body: JSON.stringify(data) }),
  getRequests: () => request<any[]>('/ivr/requests'),
  updateRequest: (id: string, data: any) =>
    request<any>(`/ivr/requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Marketplace API
export const marketplace = {
  getEquipment: (params?: Record<string, string>) =>
    request<any[]>(`/marketplace/equipment${params ? '?' + new URLSearchParams(params) : ''}`),
  getEquipmentById: (id: string) => request<any>(`/marketplace/equipment/${id}`),
  createEquipment: (data: any) =>
    request<any>('/marketplace/equipment', { method: 'POST', body: JSON.stringify(data) }),
  rentEquipment: (equipmentId: string, data: { startDate: string; endDate: string }) =>
    request<any>(`/marketplace/equipment/${equipmentId}/rent`, { method: 'POST', body: JSON.stringify(data) }),
  getProduce: (params?: Record<string, string>) =>
    request<any[]>(`/marketplace/produce${params ? '?' + new URLSearchParams(params) : ''}`),
  createProduce: (data: any) =>
    request<any>('/marketplace/produce', { method: 'POST', body: JSON.stringify(data) }),
};

// Chat API
export const chat = {
  getConversations: () => request<any[]>('/chat'),
  getMessages: (chatId: string) => request<any[]>(`/chat/${chatId}/messages`),
  sendMessage: (chatId: string, content: string) =>
    request<any>(`/chat/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  createConversation: (userId2: string, jobId?: string) =>
    request<any>('/chat', { method: 'POST', body: JSON.stringify({ userId2, jobId }) }),
};

// Notifications API
export const notifications = {
  getAll: () => request<any[]>('/notifications'),
  markRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),
  getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
};

// Analytics API
export const analytics = {
  getAdminStats: () => request<any>('/analytics/admin'),
  getFarmerStats: () => request<any>('/analytics/farmer'),
  getWorkerStats: () => request<any>('/analytics/worker'),
};

// Health check
export const health = () => request<{ status: string }>('/health');

// Helper to get the API base URL
export const getApiBase = () => API_BASE;
