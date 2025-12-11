/**
 * Flask Backend API Client
 * Replaces Supabase direct database access
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface ASHA {
  id: string;
  asha_id: string;
  name: string;
  phc_name: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export interface Mother {
  id: string;
  asha_id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  last_anc_date: string;
  gestation_weeks: number;
  flagged: boolean;
  visited: boolean;
  notes: string;
  health_status?: string;
  next_appointment_date?: string;
  medication_reminders?: boolean;
  last_period_date?: string;
  cycle_length?: number;
  post_pregnancy?: boolean;
  created_at?: string;
}

export interface PHCStock {
  id: string;
  asha_id: string;
  iron_tablets: number;
  tt_vaccine: number;
  folic_acid?: number;
  calcium_tablets?: number;
  updated_at: string;
}

export interface CallLog {
  id: string;
  asha_id: string;
  mother_id: string;
  phone: string;
  result: 'answered' | 'not_answered' | 'pressed_2' | 'busy' | 'failed';
  call_duration?: number;
  call_sid?: string;
  response_data?: string;
  created_at: string;
}

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (ashaId: string, password: string) => {
    const data = await apiRequest<{ access_token: string; asha: ASHA }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ asha_id: ashaId, password }),
    });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('asha', JSON.stringify(data.asha));
    return data;
  },

  register: async (ashaData: {
    asha_id: string;
    password: string;
    name: string;
    phc_name: string;
    phone?: string;
    email?: string;
  }) => {
    const data = await apiRequest<{ access_token: string; asha: ASHA }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(ashaData),
    });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('asha', JSON.stringify(data.asha));
    return data;
  },

  getCurrentUser: async () => {
    return apiRequest<ASHA>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('asha');
  },
};

// Mothers API
export const mothersAPI = {
  getAll: async (flagged?: boolean): Promise<Mother[]> => {
    const params = flagged !== undefined ? `?flagged=${flagged}` : '';
    return apiRequest<Mother[]>(`/mothers${params}`);
  },

  getById: async (motherId: string): Promise<Mother> => {
    return apiRequest<Mother>(`/mothers/${motherId}`);
  },

  create: async (motherData: {
    name: string;
    age: number;
    phone: string;
    address: string;
    last_anc_date: string;
    gestation_weeks: number;
    health_status?: string;
    next_appointment_date?: string;
    last_period_date?: string;
    cycle_length?: number;
    post_pregnancy?: boolean;
  }): Promise<Mother> => {
    return apiRequest<Mother>('/mothers', {
      method: 'POST',
      body: JSON.stringify(motherData),
    });
  },

  update: async (motherId: string, updates: Partial<Mother>): Promise<Mother> => {
    return apiRequest<Mother>(`/mothers/${motherId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getCallLogs: async (motherId: string): Promise<CallLog[]> => {
    return apiRequest<CallLog[]>(`/mothers/${motherId}/call-logs`);
  },

  getFlagged: async (): Promise<Mother[]> => {
    return apiRequest<Mother[]>('/mothers/flagged');
  },

  triggerCall: async (motherId: string, callType: string = 'demo_flag_alert') => {
    return apiRequest<{ success: boolean; call_sid?: string; provider?: string; message?: string; error?: string }>(
      `/mothers/${motherId}/trigger-call`,
      {
        method: 'POST',
        body: JSON.stringify({ call_type: callType }),
      }
    );
  },
};

// PHC Stock API
export const phcAPI = {
  getStock: async (): Promise<PHCStock> => {
    return apiRequest<PHCStock>('/phc/stock');
  },

  updateStock: async (updates: {
    iron_tablets?: number;
    tt_vaccine?: number;
    folic_acid?: number;
    calcium_tablets?: number;
  }): Promise<PHCStock> => {
    return apiRequest<PHCStock>('/phc/stock', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// IVR/Call API
export const ivrAPI = {
  initiateCall: async (motherId: string, callType: string = 'reminder') => {
    return apiRequest<{ success: boolean; call_sid?: string; error?: string }>(
      '/ivr/initiate-call',
      {
        method: 'POST',
        body: JSON.stringify({ mother_id: motherId, call_type: callType }),
      }
    );
  },

  scheduleCall: async (motherId: string, scheduledTime: string, callType: string = 'reminder') => {
    return apiRequest('/ivr/schedule-call', {
      method: 'POST',
      body: JSON.stringify({
        mother_id: motherId,
        scheduled_time: scheduledTime,
        call_type: callType,
      }),
    });
  },

  getCallLogs: async (): Promise<CallLog[]> => {
    return apiRequest<CallLog[]>('/ivr/call-logs');
  },
};

