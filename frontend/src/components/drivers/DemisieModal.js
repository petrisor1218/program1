import React, { useState } from 'react';
import Modal from '../shared/modals/Modal';
import FormInput from '../shared/forms/FormInput';
import Button from '../shared/buttons/Button';

const DemisieModal = ({ isOpen, onClose, driver, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        dataDemisie: new Date().toISOString().split('T')[0],
        motiv: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting demisie:', error);
            setError('Eroare la procesarea demisiei');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Demisie ${driver?.nume}`}
            size="md"
        >
            <div className="p-4">
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-4">
                        Completați detaliile demisiei pentru șoferul {driver?.nume}.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <FormInput
                            label="Data Demisiei"
                            type="date"
                            value={formData.dataDemisie}
                            onChange={(e) => setFormData({...formData, dataDemisie: e.target.value})}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <FormInput
                            label="Motiv"
                            type="text"
                            placeholder="Introduceți motivul demisiei"
                            value={formData.motiv}
                            onChange={(e) => setFormData({...formData, motiv: e.target.value})}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Anulează
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            disabled={loading}
                        >
                            {loading ? 'Se procesează...' : 'Confirmă Demisia'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default DemisieModal;