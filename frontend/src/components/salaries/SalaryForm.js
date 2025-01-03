import React, { useState, useEffect } from 'react';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';
import api from '../../services/api';

const SalaryForm = ({ salary, onSubmit, onClose }) => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sofer: '',
        luna: new Date().getMonth() + 1,
        an: new Date().getFullYear(),
        salariuBaza: 0,
        diurna: 0,
        bonusuri: [],
        deduceri: [],
        avansuri: [],
        status: 'Draft',
        observatii: ''
    });

    useEffect(() => {
        loadDrivers();
        if (salary) {
            setFormData(salary);
        }
    }, [salary]);

    const loadDrivers = async () => {
        try {
            const response = await api.get('/drivers', {
                params: {
                    includeInactive: true // Include și șoferii inactivi pentru salarii istorice
                }
            });
            setDrivers(response.data);
        } catch (error) {
            console.error('Error loading drivers:', error);
        }
    };

    const addBonus = () => {
        setFormData(prev => ({
            ...prev,
            bonusuri: [...prev.bonusuri, { tip: '', suma: 0, observatii: '' }]
        }));
    };

    const updateBonus = (index, field, value) => {
        const newBonusuri = [...formData.bonusuri];
        newBonusuri[index][field] = value;
        setFormData(prev => ({
            ...prev,
            bonusuri: newBonusuri
        }));
    };

    const removeBonus = (index) => {
        setFormData(prev => ({
            ...prev,
            bonusuri: prev.bonusuri.filter((_, i) => i !== index)
        }));
    };

    const addDeducere = () => {
        setFormData(prev => ({
            ...prev,
            deduceri: [...prev.deduceri, { tip: '', suma: 0, observatii: '' }]
        }));
    };

    const updateDeducere = (index, field, value) => {
        const newDeduceri = [...formData.deduceri];
        newDeduceri[index][field] = value;
        setFormData(prev => ({
            ...prev,
            deduceri: newDeduceri
        }));
    };

    const removeDeducere = (index) => {
        setFormData(prev => ({
            ...prev,
            deduceri: prev.deduceri.filter((_, i) => i !== index)
        }));
    };

    const addAvans = () => {
        setFormData(prev => ({
            ...prev,
            avansuri: [...prev.avansuri, { data: new Date().toISOString().split('T')[0], suma: 0 }]
        }));
    };

    const updateAvans = (index, field, value) => {
        const newAvansuri = [...formData.avansuri];
        newAvansuri[index][field] = value;
        setFormData(prev => ({
            ...prev,
            avansuri: newAvansuri
        }));
    };

    const removeAvans = (index) => {
        setFormData(prev => ({
            ...prev,
            avansuri: prev.avansuri.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedDriver = drivers.find(d => d._id === formData.sofer);
            let adjustedFormData = { ...formData };

            // Ajustează calculele pentru șoferii inactivi
            if (selectedDriver && !selectedDriver.activ) {
                const lastDay = new Date(formData.an, formData.luna, 0);
                if (selectedDriver.dataIncheiereContract) {
                    const dataIncheiereContract = new Date(selectedDriver.dataIncheiereContract);
                    if (dataIncheiereContract < lastDay) {
                        // Ajustează salariul proporțional cu zilele lucrate
                        const totalDays = lastDay.getDate();
                        const workedDays = Math.min(dataIncheiereContract.getDate(), totalDays);
                        adjustedFormData.salariuBaza = Math.round(
                            (formData.salariuBaza / totalDays) * workedDays
                        );
                    }
                }
            }

            await onSubmit(adjustedFormData);
            if (onClose) onClose();
        } catch (error) {
            console.error('Error submitting salary:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Șofer"
                    value={formData.sofer}
                    onChange={(e) => setFormData({...formData, sofer: e.target.value})}
                    required
                >
                    <option value="">Selectează șofer</option>
                    {drivers.map(driver => (
                        <option key={driver._id} value={driver._id}>
                            {driver.nume} {!driver.activ && '(Inactiv)'}
                        </option>
                    ))}
                </Select>

                <div className="grid grid-cols-2 gap-2">
                    <Select
                        label="Luna"
                        value={formData.luna}
                        onChange={(e) => setFormData({...formData, luna: parseInt(e.target.value)})}
                        required
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2000, i, 1).toLocaleString('ro-RO', { month: 'long' })}
                            </option>
                        ))}
                    </Select>

                    <FormInput
                        type="number"
                        label="An"
                        value={formData.an}
                        onChange={(e) => setFormData({...formData, an: parseInt(e.target.value)})}
                        min={2000}
                        max={2100}
                        required
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Salariu & Diurnă</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        type="number"
                        label="Salariu Bază (RON)"
                        value={formData.salariuBaza}
                        onChange={(e) => setFormData({...formData, salariuBaza: parseFloat(e.target.value)})}
                        min={0}
                        required
                    />
                    <FormInput
                        type="number"
                        label="Diurnă (EUR)"
                        value={formData.diurna}
                        onChange={(e) => setFormData({...formData, diurna: parseFloat(e.target.value)})}
                        min={0}
                    />
                </div>
            </div>

            {/* Bonusuri */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Bonusuri</h3>
                    <Button type="button" variant="secondary" onClick={addBonus}>
                        Adaugă Bonus
                    </Button>
                </div>
                {formData.bonusuri.map((bonus, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                        <FormInput
                            label="Tip"
                            value={bonus.tip}
                            onChange={(e) => updateBonus(index, 'tip', e.target.value)}
                        />
                        <FormInput
                            type="number"
                            label="Sumă (RON)"
                            value={bonus.suma}
                            onChange={(e) => updateBonus(index, 'suma', parseFloat(e.target.value))}
                        />
                        <div className="flex items-end">
                            <Button type="button" variant="danger" onClick={() => removeBonus(index)}>
                                Șterge
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Deduceri */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Deduceri</h3>
                    <Button type="button" variant="secondary" onClick={addDeducere}>
                        Adaugă Deducere
                    </Button>
                </div>
                {formData.deduceri.map((deducere, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                        <FormInput
                            label="Tip"
                            value={deducere.tip}
                            onChange={(e) => updateDeducere(index, 'tip', e.target.value)}
                        />
                        <FormInput
                            type="number"
                            label="Sumă (RON)"
                            value={deducere.suma}
                            onChange={(e) => updateDeducere(index, 'suma', parseFloat(e.target.value))}
                        />
                        <div className="flex items-end">
                            <Button type="button" variant="danger" onClick={() => removeDeducere(index)}>
                                Șterge
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Avansuri */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Avansuri</h3>
                    <Button type="button" variant="secondary" onClick={addAvans}>
                        Adaugă Avans
                    </Button>
                </div>
                {formData.avansuri.map((avans, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                        <FormInput
                            type="date"
                            label="Data"
                            value={avans.data}
                            onChange={(e) => updateAvans(index, 'data', e.target.value)}
                        />
                        <FormInput
                            type="number"
                            label="Sumă (RON)"
                            value={avans.suma}
                            onChange={(e) => updateAvans(index, 'suma', parseFloat(e.target.value))}
                        />
                        <div className="flex items-end">
                            <Button type="button" variant="danger" onClick={() => removeAvans(index)}>
                                Șterge
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <FormInput
                    label="Observații"
                    type="textarea"
                    value={formData.observatii}
                    onChange={(e) => setFormData({...formData, observatii: e.target.value})}
                />
            </div>

            <div className="flex justify-end space-x-2">
                {onClose && (
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Anulează
                    </Button>
                )}
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Se salvează...' : (salary ? 'Actualizează' : 'Adaugă')}
                </Button>
            </div>
        </form>
    );
};

export default SalaryForm;