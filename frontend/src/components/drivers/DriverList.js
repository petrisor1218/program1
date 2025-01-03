import React, { useState, useEffect } from 'react';
import DataTable from '../shared/tables/DataTable';
import Button from '../shared/buttons/Button';
import { driversAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import DriverFormModal from './DriverFormModal';
import DemisieModal from './DemisieModal';
import DriverStatusModal from './DriverStatusModal';

const DriverList = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isDemisieModalOpen, setIsDemisieModalOpen] = useState(false);
    const [driverForDemisie, setDriverForDemisie] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedDriverForStatus, setSelectedDriverForStatus] = useState(null);
    const [statusType, setStatusType] = useState('plecare');

    const columns = [
        { key: 'nume', label: 'Nume' },
        { key: 'cnp', label: 'CNP' },
        { 
            key: 'status', 
            label: 'Status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    status === 'Activ' ? 'bg-green-100 text-green-800' :
                    status === 'Plecat' ? 'bg-blue-100 text-blue-800' :
                    status === 'In Tara' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {status}
                </span>
            )
        },
        { 
            key: 'dataAngajare', 
            label: 'Data Angajării',
            render: (date) => formatDate(date)
        },
        {
            key: 'zileLunaCurenta',
            label: 'Zile Luna Curentă',
            render: (value) => value || 0
        },
        {
            key: 'diurnaLunaCurenta',
            label: 'Diurnă Luna Curentă',
            render: (value) => `${value || 0} EUR`
        }
    ];

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            const response = await driversAPI.getAll({ activ: true });
            setDrivers(response.data);
        } catch (error) {
            console.error('Error loading drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Funcție nouă pentru deschiderea modalului de status
    const handleStatusChange = (driver) => {
        setSelectedDriverForStatus(driver);
        setStatusType(driver.status === 'Plecat' ? 'sosire' : 'plecare');
        setIsStatusModalOpen(true);
    };

    // Funcție nouă pentru procesarea datelor din modal
    const handleStatusSubmit = async (formData) => {
        try {
            if (!selectedDriverForStatus) return;

            if (statusType === 'plecare') {
                await driversAPI.update(selectedDriverForStatus._id, {
                    status: 'Plecat',
                    dataStart: formData.dataStart,
                    zonaCurse: formData.zonaCurse,
                    diurnaZi: formData.diurnaZi
                });
            } else {
                await driversAPI.update(selectedDriverForStatus._id, {
                    status: 'In Tara',
                    dataUltimaSosire: formData.dataFinal,
                    observatii: formData.observatii
                });
            }

            setIsStatusModalOpen(false);
            setSelectedDriverForStatus(null);
            await loadDrivers();
        } catch (error) {
            console.error('Error updating driver status:', error);
        }
    };

    const handleDemisie = (driver) => {
        setDriverForDemisie(driver);
        setIsDemisieModalOpen(true);
    };

    const handleDemisieSubmit = async (formData) => {
        try {
            await driversAPI.update(driverForDemisie._id, {
                status: 'Inactiv',
                activ: false,
                dataIncheiereContract: formData.dataDemisie,
                motivDemisie: formData.motiv,
                dataUltimaSosire: new Date().toISOString()
            });
            
            setIsDemisieModalOpen(false);
            setDriverForDemisie(null);
            await loadDrivers();
        } catch (error) {
            console.error('Error processing demisie:', error);
        }
    };

    const handleAddDriver = () => {
        setSelectedDriver(null);
        setIsModalOpen(true);
    };

    const handleEditDriver = (driver) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedDriver) {
                await driversAPI.update(selectedDriver._id, formData);
            } else {
                await driversAPI.create(formData);
            }
            await loadDrivers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving driver:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Șoferi</h2>
                <Button
                    variant="primary"
                    onClick={handleAddDriver}
                >
                    Adaugă Șofer
                </Button>
            </div>

            <DataTable
                data={drivers}
                columns={columns}
                loading={loading}
                actions={(driver) => (
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditDriver(driver)}
                        >
                            Editează
                        </Button>
                        <Button
                            size="sm"
                            variant={driver.status === 'Plecat' ? 'success' : 'primary'}
                            onClick={() => handleStatusChange(driver)}
                        >
                            {driver.status === 'Plecat' ? 'Marcare Sosit' : 'Marcare Plecat'}
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDemisie(driver)}
                        >
                            Demisie
                        </Button>
                    </div>
                )}
            />

            <DriverFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                driver={selectedDriver}
                onSubmit={handleSubmit}
            />

            <DemisieModal
                isOpen={isDemisieModalOpen}
                onClose={() => {
                    setIsDemisieModalOpen(false);
                    setDriverForDemisie(null);
                }}
                driver={driverForDemisie}
                onSubmit={handleDemisieSubmit}
            />

            <DriverStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => {
                    setIsStatusModalOpen(false);
                    setSelectedDriverForStatus(null);
                }}
                driver={selectedDriverForStatus}
                type={statusType}
                onSubmit={handleStatusSubmit}
            />
        </div>
    );
};

export default DriverList;