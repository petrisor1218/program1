import axios from 'axios';

// Configurare de bază pentru Axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor pentru request-uri
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Interceptor pentru răspunsuri
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    register: (data) => api.post('/auth/register', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

// Drivers API
const driversAPI = {
    getAll: () => api.get('/drivers'),
    getById: (id) => api.get(`/drivers/${id}`),
    create: (data) => api.post('/drivers', data),
    update: (id, data) => api.put(`/drivers/${id}`, data),
    delete: (id) => api.delete(`/drivers/${id}`),
    updateStatus: (id, status) => api.put(`/drivers/${id}/status`, { status }),
    getPerioade: (driverId) => api.get(`/drivers/${driverId}/perioade`),
    getDiurna: (driverId) => api.get(`/drivers/${driverId}/diurna`),
    addDiurna: (driverId, data) => api.post(`/drivers/${driverId}/diurna`, data),
    updateDiurna: (driverId, diurnaId, data) => api.put(`/drivers/${driverId}/diurna/${diurnaId}`, data),
    deleteDiurna: (driverId, diurnaId) => api.delete(`/drivers/${driverId}/diurna/${diurnaId}`),
};

// Dashboard API
const dashboardAPI = {
    getOverview: () => api.get('/dashboard/overview'),
    getStats: () => api.get('/dashboard/stats'),
    getActivity: () => api.get('/dashboard/activity'),
    getDriverStatus: () => api.get('/dashboard/driver-status'),
    getExpiringDocuments: () => api.get('/dashboard/expiring-documents'),
    getRecentActivity: () => api.get('/dashboard/recent-activity'),
    getUpcomingHolidays: () => api.get('/dashboard/upcoming-holidays'),
    getPendingApprovals: () => api.get('/dashboard/pending-approvals'),
    getFinancialSummary: () => api.get('/dashboard/financial-summary'),
    getDriverStats: () => api.get('/dashboard/driver-stats'),
};

// Salaries API
const salariesAPI = {
    getAll: () => api.get('/salaries'),
    getById: (id) => api.get(`/salaries/${id}`),
    calculate: (data) => api.post('/salaries/calculate', data),
    save: (data) => api.post('/salaries', data),
    update: (id, data) => api.put(`/salaries/${id}`, data),
    delete: (id) => api.delete(`/salaries/${id}`),
    finalize: (id, data) => api.post(`/salaries/${id}/finalize`, data),
    getPerioade: (driverId) => api.get(`/salaries/perioade/${driverId}`),
    getDiurna: (params) => api.get('/salaries/diurna', { params }),
    addDeduction: (id, data) => api.post(`/salaries/${id}/deductions`, data),
    removeDeduction: (id, deductionId) => api.delete(`/salaries/${id}/deductions/${deductionId}`),
};

// Holidays API
const holidaysAPI = {
    getAll: () => api.get('/holidays'),
    getById: (id) => api.get(`/holidays/${id}`),
    request: (data) => api.post('/holidays/request', data),
    approve: (id) => api.put(`/holidays/${id}/approve`),
    reject: (id, reason) => api.put(`/holidays/${id}/reject`, { reason }),
    cancel: (id) => api.put(`/holidays/${id}/cancel`),
    getPending: () => api.get('/holidays/pending'),
    getByDriver: (driverId) => api.get(`/holidays/driver/${driverId}`),
};

// Fines API
const finesAPI = {
    getAll: () => api.get('/fines'),
    getById: (id) => api.get(`/fines/${id}`),
    create: (data) => api.post('/fines', data),
    update: (id, data) => api.put(`/fines/${id}`, data),
    delete: (id) => api.delete(`/fines/${id}`),
    pay: (id) => api.post(`/fines/${id}/pay`),
    getByDriver: (driverId) => api.get(`/fines/driver/${driverId}`),
};

// Reports API
const reportsAPI = {
    getSalaryReport: (params) => api.get('/reports/salaries', { params }),
    getDiurnaReport: (params) => api.get('/reports/diurna', { params }),
    getDriverReport: (params) => api.get('/reports/drivers', { params }),
    getHolidayReport: (params) => api.get('/reports/holidays', { params }),
    getFinesReport: (params) => api.get('/reports/fines', { params }),
    getActivityReport: (params) => api.get('/reports/activity', { params }),
    downloadReport: (type, params) => api.get(`/reports/${type}/download`, { params, responseType: 'blob' }),
};

// Documents API
const documentsAPI = {
    getAll: () => api.get('/documents'),
    getById: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
    getByDriver: (driverId) => api.get(`/documents/driver/${driverId}`),
    uploadDocument: (data) => api.post('/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export {
    api as default,
    authAPI,
    driversAPI,
    dashboardAPI,
    salariesAPI,
    holidaysAPI,
    finesAPI,
    reportsAPI,
    documentsAPI
};