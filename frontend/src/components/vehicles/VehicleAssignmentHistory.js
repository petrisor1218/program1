// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleAssignmentHistory.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const VehicleAssignmentHistory = ({ vehicleId }) => {
   const [history, setHistory] = useState([]);

   useEffect(() => {
       if (vehicleId) loadHistory();
   }, [vehicleId]);

   const loadHistory = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/assignment-history`);
       setHistory(response.data);
   };

   return (
       <div className="space-y-4">
           {history.map((entry, index) => (
               <div 
                   key={index}
                   className="border-l-4 border-blue-500 pl-4 pb-4"
               >
                   <p className="font-medium">{entry.driver?.nume}</p>
                   <p className="text-sm text-gray-500">
                       {formatDate(entry.startDate)} - {
                           entry.endDate ? 
                           formatDate(entry.endDate) : 
                           'Prezent'
                       }
                   </p>
               </div>
           ))}
       </div>
   );
};

export default VehicleAssignmentHistory;