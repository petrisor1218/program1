import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { dashboardAPI } from '../../services/api';

export function ExpiringDocuments() {
    const [documents, setDocuments] = useState([]); // Inițializat cu un array gol
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const response = await dashboardAPI.getExpiringDocuments();
            console.log('API response:', response.data); // Log pentru debugging
            const data = Array.isArray(response.data) ? response.data : []; // Asigură că este un array
            setDocuments(data); // Actualizare state
        } catch (err) {
            console.error('Error loading documents:', err); // Log pentru erori
            setError('Eroare la încărcarea documentelor.');
            setDocuments([]); // Asigură că rămâne un array
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader title="Documente care Expiră" />
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader title="Documente care Expiră" />
                <CardContent>
                    <p className="text-red-600">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader title="Documente care Expiră" />
            <CardContent>
                <div className="space-y-4">
                    {Array.isArray(documents) && documents.length > 0 ? (
                        documents.map((doc) => (
                            <div key={doc.id} className="flex justify-between items-center p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">{doc.tip}</p>
                                    <p className="text-sm text-muted-foreground">{doc.entitate}</p>
                                </div>
                                <p
                                    className={`text-sm font-medium ${
                                        new Date(doc.dataExpirare) < new Date()
                                            ? 'text-red-600'
                                            : 'text-yellow-600'
                                    }`}
                                >
                                    {new Date(doc.dataExpirare).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">Nu există documente care expiră în curând.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
