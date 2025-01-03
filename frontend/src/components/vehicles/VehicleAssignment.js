// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleAssignment.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const VehicleAssignment = ({ vehicleId }) => {
   const [drivers, setDrivers] = useState([]);
   const [selectedDriver, setSelectedDriver] = useState('');
   const [loading, setLoading] = useState(false);

   useEffect(() => {
       loadAvailableDrivers();
   }, []);

   const loadAvailableDrivers = async () => {
       const response = await api.get('/drivers', { 
           params: { available: true } 
       });
       setDrivers(response.data);
   };

   const handleAssign = async () => {
       if (!selectedDriver) return;
       
       setLoading(true);
       try {
           await api.post(`/vehicles/${vehicleId}/assign`, {
               driverId: selectedDriver
           });
           // Reset and reload data
           setSelectedDriver('');
           loadAvailableDrivers();
       } catch (error) {
           console.error('Error assigning driver:', error);
       } finally {
           setLoading(false);
       }
   };

   return (
       <div className="flex gap-4">
           <Select
               value={selectedDriver}
               onChange={e => setSelectedDriver(e.target.value)}
               options={drivers.map(driver => ({
                   value: driver._id,
                   label: driver.nume
               }))}
               placeholder="Selectează șofer"
               className="flex-1"
           />
           <Button
               onClick={handleAssign}
               disabled={!selectedDriver || loading}
               variant="primary"
           >
               Asignează Șofer
           </Button>
       </div>
   );
};

export default VehicleAssignment;