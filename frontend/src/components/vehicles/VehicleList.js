// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../shared/tables/DataTable';
import Button from '../shared/buttons/Button';
import { formatDate } from '../../utils/dateUtils';

const VehicleList = () => {
   const [vehicles, setVehicles] = useState([]);
   const [loading, setLoading] = useState(true);

   const columns = [
       { key: 'id', label: 'ID' },
       { key: 'nume', label: 'Nume' },
       { key: 'tip', label: 'Tip' },
       { key: 'kmCurent', label: 'KM' },
       {
           key: 'dataAchizitie',
           label: 'Data Achiziție',
           render: (date) => formatDate(date)
       },
       {
           key: 'status',
           label: 'Status',
           render: (status) => (
               <span className={`px-2 py-1 rounded-full text-xs ${
                   status === 'Activ' ? 'bg-green-100 text-green-800' :
                   status === 'Service' ? 'bg-yellow-100 text-yellow-800' :
                   'bg-red-100 text-red-800'
               }`}>
                   {status}
               </span>
           )
       }
   ];

   useEffect(() => {
       loadVehicles();
   }, []);

   const loadVehicles = async () => {
       try {
           const response = await api.get('/vehicles');
           setVehicles(response.data);
       } catch (error) {
           console.error('Error loading vehicles:', error);
       } finally {
           setLoading(false);
       }
   };

   return (
       <div>
           <div className="flex justify-between mb-4">
               <h2 className="text-2xl font-bold">Vehicule</h2>
               <Button
                   variant="primary"
                   onClick={() => {/* handle add */}}
               >
                   Adaugă Vehicul
               </Button>
           </div>
           
           <DataTable
               data={vehicles}
               columns={columns}
               loading={loading}
               onRowClick={(vehicle) => {/* handle click */}}
           />
       </div>
   );
};

export default VehicleList;