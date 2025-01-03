import React, { useState } from 'react';
import Modal from '../../shared/modals/Modal';
import Button from '../../shared/buttons/Button';
const AvansModal = ({ isOpen, onClose, onSubmit }) => {
    const [avans, setAvans] = useState({
        suma: 0,
        descriere: 'Avans salarial'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(avans);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adaugă Avans">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sumă (RON)</label>
                    <input
                        type="number"
                        value={avans.suma}
                        onChange={(e) => setAvans(prev => ({ ...prev, suma: parseFloat(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                    <textarea
                        value={avans.descriere}
                        onChange={(e) => setAvans(prev => ({ ...prev, descriere: e.target.value }))}
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

export default AvansModal;