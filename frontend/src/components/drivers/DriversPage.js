import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import DataTable from '../shared/tables/DataTable';
import Modal from '../shared/Modal';
import DriverForm from './DriverForm';

const DriversPage = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            const response = await driversAPI.getAll();
            setDrivers(response.data);
            setError(null);
        } catch (error) {
            console.error('Error loading drivers:', error);
            setError('Nu s-au putut încărca datele șoferilor');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (data) => {
        try {
            await driversAPI.create(data);
            await loadDrivers();
            setShowForm(false);
            setError(null);
        } catch (error) {
            console.error('Error adding driver:', error);
            setError('Nu s-a putut adăuga șoferul');
        }
    };

    const handleEdit = async (data) => {
        try {
            await driversAPI.update(selectedDriver._id, data);
            await loadDrivers();
            setShowForm(false);
            setError(null);
        } catch (error) {
            console.error('Error updating driver:', error);
            setError('Nu s-a putut actualiza șoferul');
        }
    };

    const columns = [
        { key: 'nume', label: 'Nume' },
        { key: 'status', label: 'Status' },
        { 
            key: 'vehiculAsignat', 
            label: 'Vehicul', 
            render: v => v?.numarInmatriculare || '-'
        },
        {
            key: 'dataAngajare',
            label: 'Data Angajării',
            render: date => new Date(date).toLocaleDateString()
        }
    ];

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Șoferi</h2>
                <button
                    onClick={() => {
                        setSelectedDriver(null);
                        setShowForm(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Adaugă Șofer
                </button>
            </div>

            <DataTable
                data={drivers}
                columns={columns}
                loading={loading}
                onRowClick={setSelectedDriver}
            />

            {showForm && (
                <Modal
                    title={selectedDriver ? 'Editare Șofer' : 'Adaugă Șofer'}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedDriver(null);
                    }}
                >
                    <DriverForm
                        driver={selectedDriver}
                        onSubmit={selectedDriver ? handleEdit : handleAdd}
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedDriver(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default DriversPage;