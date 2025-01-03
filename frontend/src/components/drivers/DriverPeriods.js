import React, { useState } from 'react';
import { driversAPI } from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';
import { formatDate, calculateDays } from '../../utils/dateUtils';

const DriverPeriods = ({ driverId, onUpdate }) => {
    const [formData, setFormData] = useState({
        dataStart: '',
        dataFinal: '',
        status: 'Plecat',
        observatii: '',
        zonaCurse: '',
        kmStart: '',
        kmFinal: ''
    });

    const [editingPeriod, setEditingPeriod] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPeriod) {
                await driversAPI.updatePerioada(driverId, editingPeriod._id, formData);
            } else {
                await driversAPI.addPerioada(driverId, formData);
            }
            onUpdate?.();
            resetForm();
        } catch (error) {
            console.error('Error saving period:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            dataStart: '',
            dataFinal: '',
            status: 'Plecat',
            observatii: '',
            zonaCurse: '',
            kmStart: '',
            kmFinal: ''
        });
        setEditingPeriod(null);
    };

    const calculeazaDiurna = () => {
        if (formData.dataStart && formData.dataFinal) {
            const zile = calculateDays(formData.dataStart, formData.dataFinal);
            return zile * 70; // 70 EUR pe zi
        }
        return 0;
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">
                    {editingPeriod ? 'Editează Perioada' : 'Adaugă Perioadă Nouă'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput
                        label="Data Start"
                        type="date"
                        value={formData.dataStart}
                        onChange={e => setFormData({...formData, dataStart: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Data Final"
                        type="date"
                        value={formData.dataFinal}
                        onChange={e => setFormData({...formData, dataFinal: e.target.value})}
                        required
                    />
                    <Select
                        label="Status"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        options={[
                            { value: 'Plecat', label: 'Plecat' },
                            { value: 'In Tara', label: 'În Țară' }
                        ]}
                        required
                    />
                    <Select
                        label="Zonă Curse"
                        value={formData.zonaCurse}
                        onChange={e => setFormData({...formData, zonaCurse: e.target.value})}
                        options={[
                            { value: 'Germania', label: 'Germania' },
                            { value: 'Franta', label: 'Franța' },
                            { value: 'Benelux', label: 'Benelux' }
                        ]}
                        required={formData.status === 'Plecat'}
                    />
                    <FormInput
                        label="KM Start"
                        type="number"
                        value={formData.kmStart}
                        onChange={e => setFormData({...formData, kmStart: e.target.value})}
                    />
                    <FormInput
                        label="KM Final"
                        type="number"
                        value={formData.kmFinal}
                        onChange={e => setFormData({...formData, kmFinal: e.target.value})}
                    />
                </div>

                <FormInput
                    label="Observații"
                    value={formData.observatii}
                    onChange={e => setFormData({...formData, observatii: e.target.value})}
                    multiline
                    rows={3}
                />

                {formData.status === 'Plecat' && formData.dataStart && formData.dataFinal && (
                    <div className="mt-4 p-4 bg-blue-50 rounded">
                        <p className="text-sm text-blue-600">
                            Zile: {calculateDays(formData.dataStart, formData.dataFinal)}
                        </p>
                        <p className="font-medium text-blue-800">
                            Diurnă estimată: {calculeazaDiurna()} EUR
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                    {editingPeriod && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={resetForm}
                        >
                            Anulează
                        </Button>
                    )}
                    <Button type="submit" variant="primary">
                        {editingPeriod ? 'Actualizează' : 'Adaugă'} Perioada
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DriverPeriods;