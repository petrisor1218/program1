import React, { useState, useEffect } from 'react';
import { driversAPI, salariesAPI } from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Button from '../shared/buttons/Button';

const DriverSalary = ({ driverId }) => {
    const [salary, setSalary] = useState({
        salariuBaza: 0,
        diurnaZilnica: 0,
        bonusuri: [],
        deduceri: []
    });

    useEffect(() => {
        loadSalaryData();
    }, [driverId]);

    const loadSalaryData = async () => {
        try {
            const response = await driversAPI.getSalariu(driverId, {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            setSalary(response.data);
        } catch (error) {
            console.error('Error loading salary data:', error);
        }
    };

    const handleUpdate = async (field, value) => {
        try {
            const response = await driversAPI.updateSalariu(driverId, {
                [field]: value
            });
            setSalary(response.data);
        } catch (error) {
            console.error('Error updating salary:', error);
        }
    };

    return (
        <div className="space-y-4">
            <FormInput
                label="Salariu Bază"
                type="number"
                value={salary.salariuBaza}
                onChange={(e) => handleUpdate('salariuBaza', parseFloat(e.target.value))}
                min="0"
                className="w-full"
            />
            <FormInput
                label="Diurnă Zilnică"
                type="number"
                value={salary.diurnaZilnica}
                onChange={(e) => handleUpdate('diurnaZilnica', parseFloat(e.target.value))}
                min="0"
                className="w-full"
            />
            
            {/* Secțiune Bonusuri */}
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Bonusuri</h3>
                {salary.bonusuri.map((bonus, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                        <span>{bonus.descriere}: {bonus.suma} RON</span>
                    </div>
                ))}
            </div>

            {/* Secțiune Deduceri */}
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Deduceri</h3>
                {salary.deduceri.map((deducere, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                        <span>{deducere.descriere}: {deducere.suma} RON</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverSalary;