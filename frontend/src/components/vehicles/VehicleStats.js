// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleStats.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VehicleStats = ({ vehicleId }) => {
   const [stats, setStats] = useState({
       totalKm: 0,
       avgKmPerMonth: 0,
       totalServiceCosts: 0,
       lastServiceDate: null,
       nextServiceDue: null
   });

   useEffect(() => {
       if (vehicleId) loadStats();
   }, [vehicleId]);

   const loadStats = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/stats`);
       setStats(response.data);
   };

   return (
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <StatCard
               label="Total Kilometri"
               value={`${stats.totalKm} km`}
           />
           <StatCard
               label="Media Lunară"
               value={`${stats.avgKmPerMonth} km`}
           />
           <StatCard
               label="Costuri Service Total"
               value={`${stats.totalServiceCosts} RON`}
           />
           <StatCard
               label="Ultimul Service"
               value={stats.lastServiceDate ? 
                   new Date(stats.lastServiceDate).toLocaleDateString() : '-'}
           />
           <StatCard
               label="Următorul Service"
               value={stats.nextServiceDue ? 
                   new Date(stats.nextServiceDue).toLocaleDateString() : '-'}
           />
       </div>
   );
};

const StatCard = ({ label, value }) => (
   <div className="bg-white p-4 rounded-lg shadow">
       <p className="text-sm text-gray-500">{label}</p>
       <p className="text-xl font-bold">{value}</p>
   </div>
);

export default VehicleStats;