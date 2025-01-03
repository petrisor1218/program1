// frontend/src/components/dashboard/DashboardStats.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardStats = () => {
   const [stats, setStats] = useState({
       totalDrivers: 0,
       activeDrivers: 0,
       driversOnHoliday: 0,
       totalVehicles: 0
   });

   useEffect(() => {
       loadStats();
   }, []);

   const loadStats = async () => {
       try {
           const response = await api.get('/dashboard/stats');
           setStats(response.data);
       } catch (error) {
           console.error('Error loading stats:', error);
       }
   };

   return (
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <StatsCard
               title="Total Șoferi"
               value={stats.totalDrivers}
               icon="👥"
           />
           <StatsCard
               title="Șoferi Activi"
               value={stats.activeDrivers}
               icon="🚛"
               color="green"
           />
           <StatsCard
               title="În Concediu"
               value={stats.driversOnHoliday}
               icon="🏖️"
               color="blue"
           />
           <StatsCard
               title="Total Vehicule"
               value={stats.totalVehicles}
               icon="🚚"
               color="purple"
           />
       </div>
   );
};

const StatsCard = ({ title, value, icon, color = "gray" }) => (
    <div className={`bg-white p-6 rounded-lg shadow`}>
        <div className="flex items-center">
            <div className="text-3xl mr-4">{icon}</div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    </div>
);

export default DashboardStats;