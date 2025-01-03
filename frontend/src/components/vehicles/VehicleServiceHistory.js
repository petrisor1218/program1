// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleServiceHistory.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';

const VehicleServiceHistory = ({ vehicleId }) => {
   const [history, setHistory] = useState([]);
   const [totalCost, setTotalCost] = useState(0);

   useEffect(() => {
       if (vehicleId) loadHistory();
   }, [vehicleId]);

   const loadHistory = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/service`);
       setHistory(response.data);
       calculateTotalCost(response.data);
   };

   const calculateTotalCost = (data) => {
       const total = data.reduce((sum, entry) => sum + entry.cost, 0);
       setTotalCost(total);
   };

   return (
       <div className="space-y-4">
           <div className="bg-blue-50 p-4 rounded-lg">
               <p className="text-sm text-blue-600">Total Costuri Service</p>
               <p className="text-2xl font-bold text-blue-800">{totalCost} RON</p>
           </div>

           <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                   <thead>
                       <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Data
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Tip
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               KM
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Cost
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Detalii
                           </th>
                       </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                       {history.map((entry) => (
                           <tr key={entry.id}>
                               <td className="px-6 py-4 whitespace-nowrap">
                                   {formatDate(entry.date)}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                   {entry.type}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                   {entry.km}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                   {entry.cost} RON
                               </td>
                               <td className="px-6 py-4">
                                   {entry.details}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
   );
};

export default VehicleServiceHistory;