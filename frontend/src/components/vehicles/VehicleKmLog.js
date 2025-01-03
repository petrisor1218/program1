// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleKmLog.js
import React, { useState } from 'react';
import api from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Button from '../shared/buttons/Button';

const VehicleKmLog = ({ vehicleId, currentKm, onUpdate }) => {
   const [km, setKm] = useState(currentKm);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
       e.preventDefault();
       setLoading(true);
       try {
           await api.post(`/vehicles/${vehicleId}/km`, { km });
           onUpdate();
       } catch (error) {
           console.error('Error updating km:', error);
       } finally {
           setLoading(false);
       }
   };

   return (
       <form onSubmit={handleSubmit} className="flex gap-4 items-end">
           <FormInput
               label="Kilometri Actuali"
               type="number"
               value={km}
               onChange={e => setKm(e.target.value)}
               min={currentKm}
               required
           />
           <Button 
               type="submit" 
               variant="primary"
               disabled={loading}
           >
               Actualizează KM
           </Button>
       </form>
   );
};

export default VehicleKmLog;
