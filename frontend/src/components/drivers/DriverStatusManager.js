import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import Select from '../shared/forms/Select';
import { formatDate } from '../../utils/dateUtils';

const DriverStatusManager = ({ driverId }) => {
    const [status, setStatus] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (driverId) {
            loadDriverStatus();
            loadHistory();
        }
    }, [driverId]);

    const loadDriverStatus = async () => {
        try {
            const response = await driversAPI.getById(driverId);
            setStatus(response.data.status);
        } catch (error) {
            console.error('Error loading driver status:', error);
            setError('Nu s-a putut încărca statusul șoferului');
        }
    };

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await driversAPI.getStatusHistory(driverId);
            setHistory(response.data);
            setError(null);
        } catch (error) {
            console.error('Error loading status history:', error);
            setError('Nu s-a putut încărca istoricul statusurilor');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            setLoading(true);
            await driversAPI.updateStatus(driverId, newStatus);
            await loadHistory();
            setStatus(newStatus);
            setError(null);
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Nu s-a putut actualiza statusul');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: 'Activ', label: 'Activ' },
        { value: 'Plecat', label: 'Plecat' },
        { value: 'In Tara', label: 'În Țară' },
        { value: 'Concediu', label: 'Concediu' },
        { value: 'Medical', label: 'Medical' }
    ];

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Status Curent</h3>
                <Select
                    value={status}
                    onChange={(e) => updateStatus(e.target.value)}
                    options={statusOptions}
                    disabled={loading}
                    className="w-full"
                />
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Istoric Status</h3>
                {loading ? (
                    <div className="text-center py-4">Se încarcă...</div>
                ) : (
                    <div className="space-y-2">
                        {history.map((entry, index) => (
                            <div 
                                key={index} 
                                className="border-b border-gray-200 py-2 last:border-0"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            entry.status === 'Activ' ? 'bg-green-100 text-green-800' :
                                            entry.status === 'Plecat' ? 'bg-blue-100 text-blue-800' :
                                            entry.status === 'In Tara' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {entry.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(entry.timestamp)}
                                    </div>
                                </div>
                                {entry.motiv && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        Motiv: {entry.motiv}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverStatusManager;