import React, { useState, useEffect } from 'react';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';
import { driversAPI } from '../../services/api';

const DriverForm = ({ driver, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        nume: '',
        cnp: '',
        dataAngajare: '',
        dataNasterii: '',
        permisConducere: {
            serie: '',
            numar: '',
            dataExpirare: '',
            categorii: ['C', 'E']
        },
        contact: {
            telefon: '',
            email: '',
            adresa: ''
        },
        status: 'Activ',
        documente: {
            contractMunca: '',
            fisMedical: {
                data: '',
                dataExpirare: ''
            },
            avizPsihologic: {
                data: '',
                dataExpirare: ''
            }
        },
        salariuBaza: 0,
        diurnaZi: 70,
        activ: true
    });

    useEffect(() => {
        if (driver) {
            setFormData({
                ...driver,
                salariuBaza: driver.salariuBaza || 0,
                diurnaZi: driver.diurnaZi || 70
            });
        }
    }, [driver]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting driver:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date personale */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Date Personale</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Nume Complet"
                        name="nume"
                        value={formData.nume}
                        onChange={(e) => setFormData({...formData, nume: e.target.value})}
                        required
                    />
                    <FormInput
                        label="CNP"
                        name="cnp"
                        value={formData.cnp}
                        onChange={(e) => setFormData({...formData, cnp: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Data Angajării"
                        type="date"
                        name="dataAngajare"
                        value={formData.dataAngajare}
                        onChange={(e) => setFormData({...formData, dataAngajare: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Data Nașterii"
                        type="date"
                        name="dataNasterii"
                        value={formData.dataNasterii}
                        onChange={(e) => setFormData({...formData, dataNasterii: e.target.value})}
                        required
                    />
                </div>
            </div>

            {/* Permis conducere */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Permis Conducere</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Serie"
                        name="permisConducere.serie"
                        value={formData.permisConducere.serie}
                        onChange={(e) => setFormData({
                            ...formData,
                            permisConducere: {
                                ...formData.permisConducere,
                                serie: e.target.value
                            }
                        })}
                        required
                    />
                    <FormInput
                        label="Număr"
                        name="permisConducere.numar"
                        value={formData.permisConducere.numar}
                        onChange={(e) => setFormData({
                            ...formData,
                            permisConducere: {
                                ...formData.permisConducere,
                                numar: e.target.value
                            }
                        })}
                        required
                    />
                    <FormInput
                        label="Data Expirare"
                        type="date"
                        name="permisConducere.dataExpirare"
                        value={formData.permisConducere.dataExpirare}
                        onChange={(e) => setFormData({
                            ...formData,
                            permisConducere: {
                                ...formData.permisConducere,
                                dataExpirare: e.target.value
                            }
                        })}
                        required
                    />
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Telefon"
                        name="contact.telefon"
                        value={formData.contact.telefon}
                        onChange={(e) => setFormData({
                            ...formData,
                            contact: {
                                ...formData.contact,
                                telefon: e.target.value
                            }
                        })}
                    />
                    <FormInput
                        label="Email"
                        type="email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={(e) => setFormData({
                            ...formData,
                            contact: {
                                ...formData.contact,
                                email: e.target.value
                            }
                        })}
                    />
                    <FormInput
                        label="Adresă"
                        name="contact.adresa"
                        value={formData.contact.adresa}
                        onChange={(e) => setFormData({
                            ...formData,
                            contact: {
                                ...formData.contact,
                                adresa: e.target.value
                            }
                        })}
                    />
                </div>
            </div>

            {/* Informații Salariale */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Informații Salariale</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Salariu Net (RON)"
                        type="number"
                        name="salariuBaza"
                        value={formData.salariuBaza}
                        onChange={(e) => setFormData({
                            ...formData,
                            salariuBaza: parseFloat(e.target.value) || 0
                        })}
                        required
                    />
                    <FormInput
                        label="Diurnă/Zi (EUR)"
                        type="number"
                        name="diurnaZi"
                        value={formData.diurnaZi}
                        onChange={(e) => setFormData({
                            ...formData,
                            diurnaZi: parseFloat(e.target.value) || 0
                        })}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Anulează
                </Button>
                <Button type="submit" variant="primary">
                    {driver ? 'Actualizează' : 'Adaugă'} Șofer
                </Button>
            </div>
        </form>
    );
};

export default DriverForm;