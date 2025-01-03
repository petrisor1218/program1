// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\reports\SalaryReport.js
import React, { useState } from 'react';
import api from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Button from '../shared/buttons/Button';

const SalaryReport = () => {
   const [data, setData] = useState(null);
   const [filters, setFilters] = useState({
       startDate: '',
       endDate: ''
   });

   const generateReport = async () => {
       const response = await api.get('/reports/salaries', { 
           params: filters 
       });
       setData(response.data);
   };

   return (
       <div className="space-y-6">
           <div className="flex gap-4">
               <FormInput
                   type="date"
                   value={filters.startDate}
                   onChange={e => setFilters({
                       ...filters,
                       startDate: e.target.value
                   })}
                   label="Data Start"
               />
               <FormInput
                   type="date"
                   value={filters.endDate}
                   onChange={e => setFilters({
                       ...filters,
                       endDate: e.target.value
                   })}
                   label="Data Final"
               />
               <Button onClick={generateReport}>
                   Generează Raport
               </Button>
           </div>

           {data && (
               <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded shadow">
                           <h3>Total Salarii</h3>
                           <p className="text-2xl">{data.totalSalarii} RON</p>
                       </div>
                       <div className="bg-white p-4 rounded shadow">
                           <h3>Total Diurne</h3>
                           <p className="text-2xl">{data.totalDiurne} EUR</p>
                       </div>
                   </div>

                   <table className="min-w-full divide-y divide-gray-200">
                       <thead>
                           <tr>
                               <th>Șofer</th>
                               <th>Salariu</th>
                               <th>Diurnă</th>
                               <th>Total RON</th>
                           </tr>
                       </thead>
                       <tbody>
                           {data.detalii.map(item => (
                               <tr key={item._id}>
                                   <td>{item.nume}</td>
                                   <td>{item.salariu} RON</td>
                                   <td>{item.diurna} EUR</td>
                                   <td>{item.total} RON</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           )}
       </div>
   );
};

export default SalaryReport;