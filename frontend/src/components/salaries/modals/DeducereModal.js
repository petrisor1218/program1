import React, { useState } from 'react';
import Modal from '../../shared/modals/Modal';
import Button from '../../shared/buttons/Button';

const DeducereModal = ({ isOpen, onClose, onSubmit }) => {
    const [deducere, setDeducere] = useState({
        tip: 'Deducere',
        suma: 0,
        descriere: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(deducere);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adaugă Deducere">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tip Deducere</label>
                    <input
                        type="text"
                        value={deducere.tip}
                        onChange={(e) => setDeducere(prev => ({ ...prev, tip: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sumă (RON)</label>
                    <input
                        type="number"
                        value={deducere.suma}
                        onChange={(e) => setDeducere(prev => ({ ...prev, suma: parseFloat(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                    <textarea
                        value={deducere.descriere}
                        onChange={(e) => setDeducere(prev => ({ ...prev, descriere: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Anulează
                    </Button>
                    <Button type="submit" variant="primary">
                        Salvează
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default DeducereModal;