// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\holidays\HolidayStats.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const HolidayStats = ({ driverId, year }) => {
   const [stats, setStats] = useState(null);

   useEffect(() => {
       if (driverId) loadStats();
   }, [driverId, year]);

   const loadStats = async () => {
       const response = await api.get(`/holidays/stats/${driverId}`, {
           params: { year }
       });
       setStats(response.data);
   };

   if (!stats) return null;

   return (
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-lg shadow">
               <h4 className="text-sm text-gray-500">Zile Totale</h4>
               <p className="text-2xl font-bold">{stats.zileTotale}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow">
               <h4 className="text-sm text-gray-500">Zile În Țară</h4>
               <p className="text-2xl font-bold">{stats.zileInTara}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow">
               <h4 className="text-sm text-gray-500">Zile În Cursă</h4>
               <p className="text-2xl font-bold">{stats.zileInCursa}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow">
               <h4 className="text-sm text-gray-500">Zile Concediu Medical</h4>
               <p className="text-2xl font-bold">{stats.zileMedical}</p>
           </div>
       </div>
   );
};

export default HolidayStats;