const API_BASE_URL = 'http://localhost:3000/api';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// User management
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
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

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || 'API request failed');
        error.code = data.code;
        error.status = response.status;
        throw error;
    }

    return data;
};

// Auth API
export const authAPI = {
    register: (adminUsername, adminPassword, userData) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ adminUsername, adminPassword, userData }),
        }),

    enroll: (username, enrollmentSecret) =>
        apiRequest('/auth/enroll', {
            method: 'POST',
            body: JSON.stringify({ username, enrollmentSecret }),
        }),

    login: async (username, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        if (data.success && data.token) {
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    },

    logout: async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore logout errors
        }
        removeToken();
        removeUser();
    },

    getProfile: () => apiRequest('/auth/profile'),

    isAuthenticated: () => !!getToken(),

    getCurrentUser: getUser,
};

// Degree API
export const degreeAPI = {
    issue: (degreeData) =>
        apiRequest('/degrees', {
            method: 'POST',
            body: JSON.stringify(degreeData),
        }),

    verify: (degreeId) =>
        apiRequest(`/verify/${encodeURIComponent(degreeId)}`),

    revoke: (degreeId, reason) =>
        apiRequest('/degrees/revoke', {
            method: 'POST',
            body: JSON.stringify({ degreeId, reason }),
        }),

    getMyDegrees: () =>
        apiRequest('/my-degrees'),
};

// Transcript API
export const transcriptAPI = {
    add: (transcriptData) =>
        apiRequest('/transcripts', {
            method: 'POST',
            body: JSON.stringify(transcriptData),
        }),

    get: (studentId) =>
        apiRequest(`/transcripts/${encodeURIComponent(studentId)}`),

    getMyTranscript: () =>
        apiRequest('/my-transcript'),

    grantAccess: (studentId, targetMSP) =>
        apiRequest('/transcripts/grant-access', {
            method: 'POST',
            body: JSON.stringify({ studentId, targetMSP }),
        }),

    requestCorrection: (details) =>
        apiRequest('/transcripts/request-correction', {
            method: 'POST',
            body: JSON.stringify({ details }),
        }),
};

// Health API
export const healthAPI = {
    check: () => apiRequest('/health'),
};

export { getToken, setToken, removeToken, getUser, setUser, removeUser };
