import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';

const DocumentsManager = ({ driverId }) => {
    const [documents, setDocuments] = useState({
        contractMunca: '',
        fisMedical: { data: '', dataExpirare: '' },
        avizPsihologic: { data: '', dataExpirare: '' }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (driverId) {
            loadDocuments();
        }
    }, [driverId]);

    const loadDocuments = async () => {
        try {
            const response = await driversAPI.getDocuments(driverId);
            setDocuments(response.data);
            setError(null);
        } catch (error) {
            console.error('Error loading documents:', error);
            setError('Eroare la încărcarea documentelor');
        }
    };

    const handleUpload = async (type, file) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('document', file);
            await driversAPI.uploadDocument(driverId, type, formData);
            await loadDocuments();
            setError(null);
        } catch (error) {
            console.error('Error uploading document:', error);
            setError('Eroare la încărcarea documentului');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {Object.entries(documents).map(([type, value]) => (
                <div key={type} className="bg-white p-4 rounded-lg shadow">
                    <h4 className="font-medium mb-2 capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            onChange={(e) => handleUpload(type, e.target.files[0])}
                            className="hidden"
                            id={`file-${type}`}
                            disabled={loading}
                        />
                        <label
                            htmlFor={`file-${type}`}
                            className={`cursor-pointer inline-flex items-center px-4 py-2 border 
                                     border-gray-300 text-sm font-medium rounded-md 
                                     ${loading 
                                         ? 'bg-gray-100 text-gray-500' 
                                         : 'bg-white text-gray-700 hover:bg-gray-50'} 
                                     focus:outline-none`}
                        >
                            {loading ? 'Se încarcă...' : 'Încarcă Document'}
                        </label>
                        {value && (
                            <a 
                                href={value} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Vezi document
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentsManager;