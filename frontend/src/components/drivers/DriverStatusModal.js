import React, { useState } from 'react';
import Modal from '../shared/modals/Modal';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const DriverStatusModal = ({ isOpen, onClose, driver, onSubmit, type }) => {
    const [formData, setFormData] = useState({
        dataStart: new Date().toISOString().split('T')[0],
        dataFinal: new Date().toISOString().split('T')[0],
        zonaCurse: '',
        diurnaZi: 70,
        observatii: ''
    });

    const zoneOptions = [
        { value: 'Germania', label: 'Germania' },
        { value: 'Franta', label: 'Franța' },
        { value: 'Benelux', label: 'Benelux' },
        { value: 'Italia', label: 'Italia' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (type === 'plecare') {
                await onSubmit({
                    ...formData,
                    status: 'Plecat',
                    dataStart: new Date(formData.dataStart).toISOString()
                });
            } else {
                await onSubmit({
                    ...formData,
                    status: 'In Tara',
                    dataFinal: new Date(formData.dataFinal).toISOString()
                });
            }
            onClose();
        } catch (error) {
            console.error('Error updating driver status:', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'plecare' ? 'Marcare Plecare' : 'Marcare Sosire'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'plecare' ? (
                    <>
                        <FormInput
                            label="Data Plecare"
                            type="date"
                            value={formData.dataStart}
                            onChange={e => setFormData({...formData, dataStart: e.target.value})}
                            required
                        />
                        <Select
                            label="Zonă Curse"
                            value={formData.zonaCurse}
                            onChange={e => setFormData({...formData, zonaCurse: e.target.value})}
                            options={zoneOptions}
                            required
                        />
                        <FormInput
                            label="Diurnă/Zi (EUR)"
                            type="number"
                            value={formData.diurnaZi}
                            onChange={e => setFormData({...formData, diurnaZi: parseFloat(e.target.value)})}
                            min={0}
                            required
                        />
                    </>
                ) : (
                    <FormInput
                        label="Data Sosire"
                        type="date"
                        value={formData.dataFinal}
                        onChange={e => setFormData({...formData, dataFinal: e.target.value})}
                        required
                    />
                )}

                <FormInput
                    label="Observații"
                    value={formData.observatii}
                    onChange={e => setFormData({...formData, observatii: e.target.value})}
                    multiline
                    rows={3}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Anulează
                    </Button>
                    <Button type="submit" variant="primary">
                        {type === 'plecare' ? 'Marchează Plecat' : 'Marchează Sosit'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default DriverStatusModal;