// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleMaintenance.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';

const VehicleMaintenance = ({ vehicleId }) => {
   const [maintenanceData, setMaintenanceData] = useState({
       planificat: [],
       inCurs: [],
       completat: [],
       reviziiRegulare: {
           intervaleKm: 0,
           intervaleZile: 0,
           ultimaRevizie: null,
           urmatoareaRevizie: null
       },
       costuriTotale: 0
   });

   const [newMaintenance, setNewMaintenance] = useState({
       tip: '',
       descriere: '',
       dataProgramata: '',
       prioritate: 'normal',
       estimareCost: '',
       piese: [],
       furnizor: '',
       observatii: ''
   });

   useEffect(() => {
       if(vehicleId) {
           loadMaintenanceData();
       }
   }, [vehicleId]);

   const loadMaintenanceData = async () => {
       try {
           const response = await api.get(`/vehicles/${vehicleId}/maintenance`);
           setMaintenanceData(response.data);
       } catch (error) {
           console.error('Error loading maintenance data:', error);
       }
   };

   const handleAddMaintenance = async (e) => {
       e.preventDefault();
       try {
           await api.post(`/vehicles/${vehicleId}/maintenance`, newMaintenance);
           loadMaintenanceData();
           setNewMaintenance({
               tip: '',
               descriere: '',
               dataProgramata: '',
               prioritate: 'normal',
               estimareCost: '',
               piese: [],
               furnizor: '',
               observatii: ''
           });
       } catch (error) {
           console.error('Error adding maintenance:', error);
       }
   };

   const handleUpdateStatus = async (maintenanceId, newStatus) => {
       try {
           await api.patch(`/vehicles/${vehicleId}/maintenance/${maintenanceId}`, {
               status: newStatus
           });
           loadMaintenanceData();
       } catch (error) {
           console.error('Error updating maintenance status:', error);
       }
   };

   const handleAddPiesa = () => {
       setNewMaintenance(prev => ({
           ...prev,
           piese: [
               ...prev.piese,
               { denumire: '', cantitateEstimata: 1, pretEstimat: 0 }
           ]
       }));
   };

   return (
       <div className="space-y-6">
           {/* Status Mentenanță */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-4 rounded-lg shadow">
                   <h3 className="font-medium mb-2">Următoarea Revizie</h3>
                   <p className="text-2xl font-bold">
                       {formatDate(maintenanceData.reviziiRegulare.urmatoareaRevizie)}
                   </p>
                   <p className="text-sm text-gray-500">
                       sau la {maintenanceData.reviziiRegulare.intervaleKm} km
                   </p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow">
                   <h3 className="font-medium mb-2">În Lucru</h3>
                   <p className="text-2xl font-bold">{maintenanceData.inCurs.length}</p>
                   <p className="text-sm text-gray-500">intervenții în curs</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow">
                   <h3 className="font-medium mb-2">Costuri Totale</h3>
                   <p className="text-2xl font-bold">{maintenanceData.costuriTotale} RON</p>
                   <p className="text-sm text-gray-500">în ultimele 12 luni</p>
               </div>
           </div>

           {/* Programare Nouă */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Programare Nouă Mentenanță</h3>
               <form onSubmit={handleAddMaintenance} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Select
                           label="Tip Intervenție"
                           value={newMaintenance.tip}
                           onChange={e => setNewMaintenance({
                               ...newMaintenance,
                               tip: e.target.value
                           })}
                           options={[
                               { value: 'revizie', label: 'Revizie Regulată' },
                               { value: 'reparatie', label: 'Reparație' },
                               { value: 'inspectie', label: 'Inspecție' },
                               { value: 'preventiv', label: 'Mentenanță Preventivă' }
                           ]}
                           required
                       />
                       <FormInput
                           label="Data Programată"
                           type="date"
                           value={newMaintenance.dataProgramata}
                           onChange={e => setNewMaintenance({
                               ...newMaintenance,
                               dataProgramata: e.target.value
                           })}
                           required
                       />
                   </div>

                   <FormInput
                       label="Descriere"
                       value={newMaintenance.descriere}
                       onChange={e => setNewMaintenance({
                           ...newMaintenance,
                           descriere: e.target.value
                       })}
                       multiline
                       rows={3}
                       required
                   />

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <Select
                           label="Prioritate"
                           value={newMaintenance.prioritate}
                           onChange={e => setNewMaintenance({
                               ...newMaintenance,
                               prioritate: e.target.value
                           })}
                           options={[
                               { value: 'urgent', label: 'Urgent' },
                               { value: 'normal', label: 'Normal' },
                               { value: 'planificat', label: 'Planificat' }
                           ]}
                       />
                       <FormInput
                           label="Estimare Cost"
                           type="number"
                           value={newMaintenance.estimareCost}
                           onChange={e => setNewMaintenance({
                               ...newMaintenance,
                               estimareCost: e.target.value
                           })}
                       />
                       <FormInput
                           label="Furnizor"
                           value={newMaintenance.furnizor}
                           onChange={e => setNewMaintenance({
                               ...newMaintenance,
                               furnizor: e.target.value
                           })}
                       />
                   </div>

                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                           <h4 className="font-medium">Piese Necesare</h4>
                           <Button
                               type="button"
                               variant="secondary"
                               onClick={handleAddPiesa}
                           >
                               Adaugă Piesă
                           </Button>
                       </div>

                       {newMaintenance.piese.map((piesa, index) => (
                           <div key={index} className="grid grid-cols-3 gap-4">
                               <FormInput
                                   label="Denumire"
                                   value={piesa.denumire}
                                   onChange={e => {
                                       const newPiese = [...newMaintenance.piese];
                                       newPiese[index].denumire = e.target.value;
                                       setNewMaintenance({
                                           ...newMaintenance,
                                           piese: newPiese
                                       });
                                   }}
                               />
                               <FormInput
                                   label="Cantitate"
                                   type="number"
                                   value={piesa.cantitateEstimata}
                                   onChange={e => {
                                       const newPiese = [...newMaintenance.piese];
                                       newPiese[index].cantitateEstimata = e.target.value;
                                       setNewMaintenance({
                                           ...newMaintenance,
                                           piese: newPiese
                                       });
                                   }}
                               />
                               <FormInput
                                   label="Preț Estimat/buc"
                                   type="number"
                                   value={piesa.pretEstimat}
                                   onChange={e => {
                                       const newPiese = [...newMaintenance.piese];
                                       newPiese[index].pretEstimat = e.target.value;
                                       setNewMaintenance({
                                           ...newMaintenance,
                                           piese: newPiese
                                       });
                                   }}
                               />
                           </div>
                       ))}
                   </div>

                   <Button type="submit" variant="primary">
                       Adaugă Programare
                   </Button>
               </form>
           </div>

           {/* Listă Mentenanță */}
           <div className="space-y-6">
               {/* În Curs */}
               {maintenanceData.inCurs.length > 0 && (
                   <div className="bg-white p-6 rounded-lg shadow">
                       <h3 className="text-lg font-medium mb-4">În Lucru</h3>
                       {maintenanceData.inCurs.map((item, index) => (
                           <MaintenanceItem
                               key={index}
                               item={item}
                               onUpdateStatus={handleUpdateStatus}
                           />
                       ))}
                   </div>
               )}

               {/* Planificate */}
               {maintenanceData.planificat.length > 0 && (
                   <div className="bg-white p-6 rounded-lg shadow">
                       <h3 className="text-lg font-medium mb-4">Planificate</h3>
                       {maintenanceData.planificat.map((item, index) => (
                           <MaintenanceItem
                               key={index}
                               item={item}
                               onUpdateStatus={handleUpdateStatus}
                           />
                       ))}
                   </div>
               )}

               {/* Completate */}
               {maintenanceData.completat.length > 0 && (
                   <div className="bg-white p-6 rounded-lg shadow">
                       <h3 className="text-lg font-medium mb-4">Completate</h3>
                       {maintenanceData.completat.map((item, index) => (
                           <MaintenanceItem
                               key={index}
                               item={item}
                               onUpdateStatus={handleUpdateStatus}
                               readOnly
                           />
                       ))}
                   </div>
               )}
           </div>
       </div>
   );
};

const MaintenanceItem = ({ item, onUpdateStatus, readOnly }) => (
   <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
       <div className="flex justify-between items-start">
           <div>
               <p className="font-medium">{item.tip}</p>
               <p className="text-sm text-gray-500">
                   {formatDate(item.dataProgramata)}
               </p>
               <p className="mt-1">{item.descriere}</p>
           </div>
           <div className="text-right">
               <p className="font-medium">{item.estimareCost} RON</p>
               {!readOnly && (
                   <div className="mt-2">
                       <Button
                           variant="secondary"
                           size="sm"
                           onClick={() => onUpdateStatus(item._id, 'inCurs')}
                       >
                           Marchează În Lucru
                       </Button>
                       <Button
                           variant="success"
                           size="sm"
                           className="ml-2"
                           onClick={() => onUpdateStatus(item._id, 'completat')}
                       >
                           Marchează Completat
                       </Button>
                   </div>
               )}
           </div>
       </div>
       {item.piese.length > 0 && (
           <div className="mt-2">
               <p className="text-sm text-gray-500">Piese necesare:</p>
               <ul className="text-sm">
                   {item.piese.map((piesa, idx) => (
                       <li key={idx}>
                           {piesa.denumire} x{piesa.cantitateEstimata} - 
                           {piesa.pretEstimat * piesa.cantitateEstimata} RON
                       </li>
                   ))}
               </ul>
           </div>
       )}
   </div>
);

export default VehicleMaintenance;