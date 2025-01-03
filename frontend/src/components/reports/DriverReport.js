// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\reports\DriverReport.js
import React, { useState } from 'react';
import api from '../../services/api';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const DriverReport = () => {
   const [data, setData] = useState(null);
   const [year, setYear] = useState(new Date().getFullYear());
   const [month, setMonth] = useState(new Date().getMonth() + 1);

   const generateReport = async () => {
       const response = await api.get('/reports/drivers', {
           params: { year, month }
       });
       setData(response.data);
   };

   return (
       <div className="space-y-6">
           <div className="flex gap-4">
               <Select
                   value={month}
                   onChange={e => setMonth(e.target.value)}
                   options={[
                       { value: 1, label: 'Ianuarie' },
                       { value: 2, label: 'Februarie' },
                       { value: 3, label: 'Martie' },
                       { value: 4, label: 'Aprilie' },
                       { value: 5, label: 'Mai' },
                       { value: 6, label: 'Iunie' },
                       { value: 7, label: 'Iulie' },
                       { value: 8, label: 'August' },
                       { value: 9, label: 'Septembrie' },
                       { value: 10, label: 'Octombrie' },
                       { value: 11, label: 'Noiembrie' },
                       { value: 12, label: 'Decembrie' }
                   ]}
               />
               <Button onClick={generateReport}>Generează Raport</Button>
           </div>

           {data && (
               <table className="min-w-full divide-y divide-gray-200">
                   <thead>
                       <tr>
                           <th>Șofer</th>
                           <th>Zile Lucrate</th>
                           <th>Zile Concediu</th>
                           <th>Diurnă Total</th>
                       </tr>
                   </thead>
                   <tbody>
                       {data.map(item => (
                           <tr key={item._id}>
                               <td>{item.nume}</td>
                               <td>{item.zileLucrate}</td>
                               <td>{item.zileConcediu}</td>
                               <td>{item.diurnaTotal} EUR</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           )}
       </div>
   );
};

export default DriverReport;