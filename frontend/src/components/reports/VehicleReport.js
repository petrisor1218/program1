// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\reports\VehicleReport.js
import React, { useState } from 'react';
import api from '../../services/api';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const VehicleReport = () => {
   const [data, setData] = useState(null);
   const [period, setPeriod] = useState('month');

   const generateReport = async () => {
       const response = await api.get('/reports/vehicles', {
           params: { period }
       });
       setData(response.data);
   };

   return (
       <div className="space-y-6">
           <div className="flex gap-4">
               <Select
                   value={period}
                   onChange={e => setPeriod(e.target.value)}
                   options={[
                       { value: 'month', label: 'Luna Curentă' },
                       { value: 'quarter', label: 'Trimestru' },
                       { value: 'year', label: 'An' }
                   ]}
               />
               <Button onClick={generateReport}>
                   Generează Raport
               </Button>
           </div>

           {data && (
               <table className="min-w-full divide-y divide-gray-200">
                   <thead>
                       <tr>
                           <th>Vehicul</th>
                           <th>Km Parcurși</th>
                           <th>Costuri Service</th>
                           <th>Șofer Actual</th>
                       </tr>
                   </thead>
                   <tbody>
                       {data.map(item => (
                           <tr key={item._id}>
                               <td>{item.nume}</td>
                               <td>{item.kmParcursi}</td>
                               <td>{item.costuriService} RON</td>
                               <td>{item.soferActual?.nume || '-'}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           )}
       </div>
   );
};

export default VehicleReport;