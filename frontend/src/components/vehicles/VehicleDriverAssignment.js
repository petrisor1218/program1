// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleDriverAssignment.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../shared/buttons/Button';
import Select from '../shared/forms/Select';
import { formatDate } from '../../utils/dateUtils';

const VehicleDriverAssignment = ({ vehicleId }) => {
   const [availableDrivers, setAvailableDrivers] = useState([]);
   const [assignmentHistory, setAssignmentHistory] = useState([]);
   const [currentDriver, setCurrentDriver] = useState(null);
   const [selectedDriver, setSelectedDriver] = useState('');
   const [loading, setLoading] = useState(true);

   useEffect(() => {
       if (vehicleId) {
           loadData();
       }
   }, [vehicleId]);

   const loadData = async () => {
       try {
           const [driversRes, historyRes, currentRes] = await Promise.all([
               api.get('/drivers', { params: { available: true } }),
               api.get(`/vehicles/${vehicleId}/driver-history`),
               api.get(`/vehicles/${vehicleId}/current-driver`)
           ]);

           setAvailableDrivers(driversRes.data);
           setAssignmentHistory(historyRes.data);
           setCurrentDriver(currentRes.data);
       } catch (error) {
           console.error('Error loading data:', error);
       } finally {
           setLoading(false);
       }
   };

   const handleAssignment = async () => {
       if (!selectedDriver) return;

       try {
           await api.post(`/vehicles/${vehicleId}/assign-driver`, {
               driverId: selectedDriver,
               dataStart: new Date().toISOString()
           });

           // Reîncarcă datele
           loadData();
           setSelectedDriver('');
       } catch (error) {
           console.error('Error assigning driver:', error);
       }
   };

   const handleRemoveDriver = async () => {
       if (!currentDriver) return;

       try {
           await api.post(`/vehicles/${vehicleId}/remove-driver`, {
               dataStop: new Date().toISOString()
           });

           loadData();
       } catch (error) {
           console.error('Error removing driver:', error);
       }
   };

   if (loading) {
       return <div>Loading...</div>;
   }

   return (
       <div className="space-y-6">
           {/* Șofer Curent */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Șofer Curent</h3>
               {currentDriver ? (
                   <div className="flex justify-between items-start">
                       <div>
                           <p className="font-medium">{currentDriver.nume}</p>
                           <p className="text-sm text-gray-500">
                               Din data: {formatDate(currentDriver.dataStart)}
                           </p>
                           <p className="text-sm text-gray-500">
                               CNP: {currentDriver.cnp}
                           </p>
                       </div>
                       <Button
                           variant="danger"
                           onClick={handleRemoveDriver}
                       >
                           Elimină Șofer
                       </Button>
                   </div>
               ) : (
                   <div className="flex gap-4">
                       <Select
                           value={selectedDriver}
                           onChange={e => setSelectedDriver(e.target.value)}
                           options={availableDrivers.map(driver => ({
                               value: driver._id,
                               label: driver.nume
                           }))}
                           placeholder="Selectează șofer"
                           className="flex-1"
                       />
                       <Button
                           variant="primary"
                           onClick={handleAssignment}
                           disabled={!selectedDriver}
                       >
                           Asignează Șofer
                       </Button>
                   </div>
               )}
           </div>

           {/* Documente și Verificări */}
           {currentDriver && (
               <div className="bg-white p-6 rounded-lg shadow">
                   <h3 className="text-lg font-medium mb-4">Verificări Necesare</h3>
                   <div className="space-y-4">
                       <CheckItem
                           label="Permis Conducere"
                           date={currentDriver.permisConducere?.dataExpirare}
                           isValid={new Date(currentDriver.permisConducere?.dataExpirare) > new Date()}
                       />
                       <CheckItem
                           label="Card Tahograf"
                           date={currentDriver.cardTahograf?.dataExpirare}
                           isValid={new Date(currentDriver.cardTahograf?.dataExpirare) > new Date()}
                       />
                       <CheckItem
                           label="Fișă Medicală"
                           date={currentDriver.fisMedical?.dataExpirare}
                           isValid={new Date(currentDriver.fisMedical?.dataExpirare) > new Date()}
                       />
                   </div>
               </div>
           )}

           {/* Istoric Asignări */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Istoric Asignări</h3>
               <div className="space-y-4">
                   {assignmentHistory.map((assignment, index) => (
                       <div 
                           key={index}
                           className="border-l-4 border-blue-500 pl-4 py-2"
                       >
                           <p className="font-medium">{assignment.sofer.nume}</p>
                           <p className="text-sm text-gray-500">
                               {formatDate(assignment.dataStart)} - {
                                   assignment.dataStop ? 
                                   formatDate(assignment.dataStop) : 
                                   'Prezent'
                               }
                           </p>
                           {assignment.motiv && (
                               <p className="text-sm text-gray-600 mt-1">
                                   Motiv schimbare: {assignment.motiv}
                               </p>
                           )}
                       </div>
                   ))}
               </div>
           </div>

           {/* KM Log */}
           {currentDriver && (
               <div className="bg-white p-6 rounded-lg shadow">
                   <h3 className="text-lg font-medium mb-4">Kilometri</h3>
                   <div className="space-y-4">
                       <div className="flex justify-between">
                           <div>
                               <p className="text-sm text-gray-500">Km la preluare</p>
                               <p className="font-medium">
                                   {currentDriver.kmPreluare || 'Nespecificat'}
                               </p>
                           </div>
                           <div className="text-right">
                               <p className="text-sm text-gray-500">Km actuali</p>
                               <p className="font-medium">
                                   {currentDriver.kmActuali || 'Nespecificat'}
                               </p>
                           </div>
                       </div>
                   </div>
               </div>
           )}
       </div>
   );
};

const CheckItem = ({ label, date, isValid }) => (
   <div className="flex justify-between items-center">
       <div>
           <p className="font-medium">{label}</p>
           <p className="text-sm text-gray-500">
               Expiră: {formatDate(date)}
           </p>
       </div>
       <span className={`px-2 py-1 rounded-full text-xs ${
           isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
       }`}>
           {isValid ? 'Valid' : 'Expirat'}
       </span>
   </div>
);

export default VehicleDriverAssignment;