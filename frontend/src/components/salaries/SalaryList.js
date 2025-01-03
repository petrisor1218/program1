import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../shared/tables/DataTable';
import Button from '../shared/buttons/Button';
import { formatDate } from '../../utils/dateUtils';
import Select from '../shared/forms/Select';
import FormInput from '../shared/forms/FormInput';
import SalaryForm from './SalaryForm';
import Modal from '../shared/modals/Modal';

const SalaryList = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        showInactive: false
    });

    useEffect(() => {
        loadSalaries();
    }, [filters]);

    const loadSalaries = async () => {
        try {
            setLoading(true);
            const response = await api.get('/salaries', {
                params: filters
            });
            setSalaries(response.data);
            setError(null);
        } catch (error) {
            console.error('Error loading salaries:', error);
            setError('Eroare la încărcarea salariilor');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSalary = () => {
        setSelectedSalary(null);
        setShowForm(true);
    };

    const handleEditSalary = (salary) => {
        setSelectedSalary(salary);
        setShowForm(true);
    };

    const handleSubmitSalary = async (formData) => {
        try {
            setLoading(true);
            if (selectedSalary) {
                await api.put(`/salaries/${selectedSalary._id}`, formData);
            } else {
                await api.post('/salaries', {
                    ...formData,
                    luna: new Date(filters.year, filters.month - 1),
                    status: 'Draft'
                });
            }
            await loadSalaries();
            setShowForm(false);
            setError(null);
        } catch (error) {
            console.error('Error saving salary:', error);
            setError('Eroare la salvarea salariului');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (salaryId) => {
        try {
            setLoading(true);
            await api.put(`/salaries/${salaryId}/mark-paid`);
            await loadSalaries();
            setError(null);
        } catch (error) {
            console.error('Error marking salary as paid:', error);
            setError('Eroare la marcarea salariului ca plătit');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            key: 'sofer', 
            label: 'Șofer',
            render: (sofer) => (
                <div className="flex items-center">
                    <span>{sofer?.nume || '-'}</span>
                    {!sofer?.activ && (
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                            Inactiv
                        </span>
                    )}
                </div>
            )
        },
        { 
            key: 'luna', 
            label: 'Luna',
            render: (date) => formatDate(date, 'MMMM yyyy')
        },
        {
            key: 'salariuBaza',
            label: 'Salariu Bază',
            render: (value) => `${value} RON`
        },
        {
            key: 'diurna',
            label: 'Diurnă',
            render: (value) => value ? `${value} EUR` : '-'
        },
        {
            key: 'zileLucrate',
            label: 'Zile Lucrate',
            render: (value) => value || 0
        },
        {
            key: 'totalPlataRON',
            label: 'Total RON',
            render: (value) => `${value || 0} RON`
        },
        {
            key: 'totalPlataEUR',
            label: 'Total EUR',
            render: (value) => `${value || 0} EUR`
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    status === 'Achitat' ? 'bg-green-100 text-green-800' :
                    status === 'Finalizat' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {status}
                </span>
            )
        }
    ];

    const months = [
        { value: 1, label: 'Ianuarie' },
        { value: 2, label: 'Februarie' },
        { value: 3, label: 'Martie' },
        { value: 4, label: 'Aprilie' },
        { value: 5, label: 'Mai' },
        { value: 6, label: 'Iunie' },
        { value: 7, label: 'Iulie' },
        { value: 8, label: 'August' },
        { value: 9, label: 'Septembrie' },
        { value: 10, label: 'Octombrie' },
        { value: 11, label: 'Noiembrie' },
        { value: 12, label: 'Decembrie' }
    ];

    return (
        <div className="space-y-6">
            {/* Filtre */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                        label="Luna"
                        value={filters.month}
                        onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                        options={months}
                    />
                    <FormInput
                        type="number"
                        label="An"
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        min={2000}
                        max={2100}
                    />
                    <div className="flex items-center mt-8">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={filters.showInactive}
                                onChange={(e) => setFilters({...filters, showInactive: e.target.checked})}
                            />
                            <span className="ml-2">Arată și șoferii inactivi</span>
                        </label>
                    </div>
                    <div className="flex justify-end">
                        <Button 
                            variant="primary" 
                            onClick={handleAddSalary}
                            disabled={loading}
                        >
                            Adaugă Salariu
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Tabel Salarii */}
            <div className="bg-white rounded-lg shadow">
                <DataTable
                    data={salaries}
                    columns={columns}
                    loading={loading}
                    onRowClick={handleEditSalary}
                    actions={(salary) => (
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEditSalary(salary)}
                            >
                                Detalii
                            </Button>
                            {salary.status === 'Finalizat' && (
                                <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleMarkPaid(salary._id)}
                                >
                                    Marchează Achitat
                                </Button>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Modal Formular Salariu */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={selectedSalary ? 'Editare Salariu' : 'Adaugă Salariu'}
            >
                <SalaryForm
                    salary={selectedSalary}
                    onSubmit={handleSubmitSalary}
                    onClose={() => setShowForm(false)}
                />
            </Modal>
        </div>
    );
};

export default SalaryList;