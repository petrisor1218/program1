import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const SalaryReport = () => {
    const [report, setReport] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        driverId: ''
    });

    const monthOptions = [
        { value: "1", label: "Ianuarie" },
        { value: "2", label: "Februarie" },
        { value: "3", label: "Martie" },
        { value: "4", label: "Aprilie" },
        { value: "5", label: "Mai" },
        { value: "6", label: "Iunie" },
        { value: "7", label: "Iulie" },
        { value: "8", label: "August" },
        { value: "9", label: "Septembrie" },
        { value: "10", label: "Octombrie" },
        { value: "11", label: "Noiembrie" },
        { value: "12", label: "Decembrie" }
    ];

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const response = await api.get('/drivers');
            setDrivers(response.data.map(driver => ({
                value: driver._id,
                label: driver.nume
            })));
        } catch (error) {
            console.error('Error loading drivers:', error);
        }
    };

    const generateReport = async () => {
        try {
            const response = await api.get('/reports/salaries', { params: filters });
            setReport(response.data);
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                    type="number"
                    label="An"
                    value={filters.year}
                    onChange={e => setFilters({...filters, year: e.target.value})}
                />
                
                <Select
                    label="Luna"
                    name="month"
                    value={filters.month.toString()}
                    onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}
                    options={monthOptions}
                />

                <Select
                    label="Șofer"
                    name="driverId"
                    value={filters.driverId}
                    onChange={e => setFilters({...filters, driverId: e.target.value})}
                    options={[{ value: "", label: "Toți șoferii" }, ...drivers]}
                />

                <Button onClick={generateReport}>
                    Generează Raport
                </Button>
            </div>

            {report && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Raport Salarii</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Șofer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Salariu Bază
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Diurnă
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Bonusuri
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Deduceri
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {report.entries.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4">{entry.sofer.nume}</td>
                                        <td className="px-6 py-4">{entry.salariuBaza} RON</td>
                                        <td className="px-6 py-4">{entry.diurna} EUR</td>
                                        <td className="px-6 py-4">{entry.totalBonusuri} RON</td>
                                        <td className="px-6 py-4">{entry.totalDeduceri} RON</td>
                                        <td className="px-6 py-4 font-medium">
                                            {entry.total} RON + {entry.diurna} EUR
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td colSpan="6" className="px-6 py-4 font-medium">
                                        Total: {report.entries.reduce((sum, entry) => sum + entry.total, 0)} RON + {' '}
                                        {report.entries.reduce((sum, entry) => sum + entry.diurna, 0)} EUR
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryReport;