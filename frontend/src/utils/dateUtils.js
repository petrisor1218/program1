export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ro-RO');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('ro-RO');
};

export const formatDateForInput = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

export const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};