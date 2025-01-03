import React, { useState } from 'react';
import Modal from '../shared/modals/Modal';
import DriverForm from './DriverForm';

const DriverFormModal = ({ isOpen, onClose, driver, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            setError(null);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('A apărut o eroare la salvarea datelor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={driver ? 'Editare Șofer' : 'Adăugare Șofer Nou'}
            size="lg"
        >
            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                    {error}
                </div>
            )}
            
            <DriverForm
                driver={driver}
                onSubmit={handleSubmit}
                onCancel={onClose}
                disabled={loading}
            />

            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}
        </Modal>
    );
};

export default DriverFormModal;