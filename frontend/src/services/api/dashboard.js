import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/dashboard';

export const dashboardAPI = {
    // Statistici generale
    getStats: async () => {
        const response = await axios.get(`${BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Documente care expiră
    getExpiringDocuments: async () => {
        const response = await axios.get(`${BASE_URL}/documents/expiring`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Status șoferi
    getDriverStatus: async () => {
        const response = await axios.get(`${BASE_URL}/drivers/status`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};

export default dashboardAPI;