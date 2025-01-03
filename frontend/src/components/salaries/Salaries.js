// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\salaries\Salaries.js

import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import SalaryCalculator from './SalaryCalculator';
import SalaryForm from './SalaryForm';
import SalaryList from './SalaryList';
import SalaryReport from './SalaryReport';
import DiurnaManager from './DiurnaManager';
import DiurnaReport from './DiurnaReport';

const Salaries = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDriver, setSelectedDriver] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Lista Salarii
                return <SalaryList />;
            case 1: // Calculator Salariu
                return (
                    <SalaryCalculator 
                        driverId={selectedDriver}
                        month={selectedMonth}
                        year={selectedYear}
                    />
                );
            case 2: // Raport Salarii
                return <SalaryReport />;
            case 3: // Diurnă
                return <DiurnaManager driverId={selectedDriver} />;
            case 4: // Raport Diurnă
                return <DiurnaReport />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Salarii & Diurne</h1>
            </div>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Lista Salarii" />
                    <Tab label="Calculator Salariu" />
                    <Tab label="Raport Salarii" />
                    <Tab label="Gestiune Diurnă" />
                    <Tab label="Raport Diurnă" />
                </Tabs>
            </Box>

            <div className="mt-4">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Salaries;