import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const DriverHistory = ({ driverId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (driverId) loadHistory();
    }, [driverId]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await driversAPI.getStatusHistory(driverId);
            setHistory(response.data);
        } catch (error) {
            console.error('Error loading history:', error);
            setError('Nu s-a putut încărca istoricul');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((entry) => (
                <div 
                    key={entry._id}
                    className="bg-white p-4 rounded-lg shadow"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium">{entry.action}</p>
                            <p className="text-sm text-gray-500">
                                {formatDate(entry.timestamp)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                {entry.user?.nume || 'System'}
                            </p>
                        </div>
                    </div>
                    {entry.details && (
                        <p className="mt-2 text-gray-600">
                            {entry.details}
                        </p>
                    )}
                    {entry.changes && entry.changes.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">Modificări:</p>
                            {entry.changes.map((change, idx) => (
                                <div key={idx} className="text-sm">
                                    <span className="text-gray-600">{change.field}:</span>
                                    <span className="text-red-500 line-through mx-2">
                                        {change.oldValue}
                                    </span>
                                    <span className="text-green-500">
                                        {change.newValue}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Nu există istoric disponibil
                </div>
            )}
        </div>
    );
};

export default DriverHistory;