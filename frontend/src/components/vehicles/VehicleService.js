// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleService.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';
import { formatDate } from '../../utils/dateUtils';

const VehicleService = ({ vehicleId }) => {
   const [serviceHistory, setServiceHistory] = useState([]);
   const [serviceStats, setServiceStats] = useState({
       totalCosturi: 0,
       reparatiiLuna: 0,
       kmUltimulService: 0,
       kmPanaLaUrmatorul: 0
   });
   
   const [newService, setNewService] = useState({
       data: '',
       tipService: '',
       km: '',
       descriere: '',
       costuri: '',
       pieseFolosite: [],
       furnizor: '',
       factura: '',
       garantie: false,
       urmatoareaRevizie: '',
       observatii: ''
   });

   useEffect(() => {
       if (vehicleId) {
           loadServiceData();
           loadServiceStats();
       }
   }, [vehicleId]);

   const loadServiceData = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/service-history`);
       setServiceHistory(response.data);
   };

   const loadServiceStats = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/service-stats`);
       setServiceStats(response.data);
   };

   const handleAddService = async (e) => {
       e.preventDefault();
       await api.post(`/vehicles/${vehicleId}/service`, newService);
       loadServiceData();
       loadServiceStats();
       setNewService({
           data: '',
           tipService: '',
           km: '',
           descriere: '',
           costuri: '',
           pieseFolosite: [],
           furnizor: '',
           factura: '',
           garantie: false,
           urmatoareaRevizie: '',
           observatii: ''
       });
   };

   const handleAddPiesa = () => {
       setNewService(prev => ({
           ...prev,
           pieseFolosite: [
               ...prev.pieseFolosite,
               { denumire: '', cantitate: 1, pret: 0 }
           ]
       }));
   };

   return (
       <div className="space-y-6">
           {/* Statistici Service */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-lg shadow">
                   <p className="text-sm text-gray-500">Total Costuri Service</p>
                   <p className="text-2xl font-bold">{serviceStats.totalCosturi} RON</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow">
                   <p className="text-sm text-gray-500">Reparații Luna Curentă</p>
                   <p className="text-2xl font-bold">{serviceStats.reparatiiLuna} RON</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow">
                   <p className="text-sm text-gray-500">KM Ultimul Service</p>
                   <p className="text-2xl font-bold">{serviceStats.kmUltimulService}</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow">
                   <p className="text-sm text-gray-500">KM până la Următorul</p>
                   <p className="text-2xl font-bold">{serviceStats.kmPanaLaUrmatorul}</p>
               </div>
           </div>

           {/* Adaugă Service Nou */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Adaugă Service Nou</h3>
               <form onSubmit={handleAddService} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <FormInput
                           label="Data"
                           type="date"
                           value={newService.data}
                           onChange={e => setNewService({
                               ...newService,
                               data: e.target.value
                           })}
                           required
                       />
                       <FormInput
                           label="Kilometri"
                           type="number"
                           value={newService.km}
                           onChange={e => setNewService({
                               ...newService,
                               km: e.target.value
                           })}
                           required
                       />
                       <Select
                           label="Tip Service"
                           value={newService.tipService}
                           onChange={e => setNewService({
                               ...newService,
                               tipService: e.target.value
                           })}
                           options={[
                               { value: 'Revizie', label: 'Revizie' },
                               { value: 'Reparatie', label: 'Reparație' },
                               { value: 'ITP', label: 'ITP' },
                               { value: 'Tahograf', label: 'Tahograf' }
                           ]}
                           required
                       />
                   </div>

                   <FormInput
                       label="Descriere Lucrări"
                       value={newService.descriere}
                       onChange={e => setNewService({
                           ...newService,
                           descriere: e.target.value
                       })}
                       multiline
                       rows={3}
                       required
                   />

                   <div className="space-y-2">
                       <div className="flex justify-between items-center">
                           <h4 className="font-medium">Piese Folosite</h4>
                           <Button
                               type="button"
                               variant="secondary"
                               onClick={handleAddPiesa}
                           >
                               Adaugă Piesă
                           </Button>
                       </div>

                       {newService.pieseFolosite.map((piesa, index) => (
                           <div key={index} className="grid grid-cols-3 gap-4">
                               <FormInput
                                   label="Denumire"
                                   value={piesa.denumire}
                                   onChange={e => {
                                       const newPiese = [...newService.pieseFolosite];
                                       newPiese[index].denumire = e.target.value;
                                       setNewService({
                                           ...newService,
                                           pieseFolosite: newPiese
                                       });
                                   }}
                               />
                               <FormInput
                                   label="Cantitate"
                                   type="number"
                                   value={piesa.cantitate}
                                   onChange={e => {
                                       const newPiese = [...newService.pieseFolosite];
                                       newPiese[index].cantitate = e.target.value;
                                       setNewService({
                                           ...newService,
                                           pieseFolosite: newPiese
                                       });
                                   }}
                               />
                               <FormInput
                                   label="Preț/buc"
                                   type="number"
                                   value={piesa.pret}
                                   onChange={e => {
                                       const newPiese = [...newService.pieseFolosite];
                                       newPiese[index].pret = e.target.value;
                                       setNewService({
                                           ...newService,
                                           pieseFolosite: newPiese
                                       });
                                   }}
                               />
                           </div>
                       ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormInput
                           label="Furnizor"
                           value={newService.furnizor}
                           onChange={e => setNewService({
                               ...newService,
                               furnizor: e.target.value
                           })}
                       />
                       <FormInput
                           label="Număr Factură"
                           value={newService.factura}
                           onChange={e => setNewService({
                               ...newService,
                               factura: e.target.value
                           })}
                       />
                   </div>

                   <Button type="submit" variant="primary">
                       Adaugă Service
                   </Button>
               </form>
           </div>

           {/* Istoric Service */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Istoric Service</h3>
               <div className="space-y-4">
                   {serviceHistory.map((service, index) => (
                       <div 
                           key={index}
                           className="border-l-4 border-blue-500 pl-4 py-2"
                       >
                           <div className="flex justify-between items-start">
                               <div>
                                   <p className="font-medium">
                                       {service.tipService} - {formatDate(service.data)}
                                   </p>
                                   <p className="text-sm text-gray-500">
                                       {service.km} km
                                   </p>
                                   <p className="mt-1">{service.descriere}</p>
                               </div>
                               <div className="text-right">
                                   <p className="font-medium">{service.costuri} RON</p>
                                   <p className="text-sm text-gray-500">
                                       {service.furnizor}
                                   </p>
                               </div>
                           </div>
                           {service.pieseFolosite.length > 0 && (
                               <div className="mt-2">
                                   <p className="text-sm text-gray-500">Piese folosite:</p>
                                   <ul className="text-sm">
                                       {service.pieseFolosite.map((piesa, idx) => (
                                           <li key={idx}>
                                               {piesa.denumire} x{piesa.cantitate} - 
                                               {piesa.pret * piesa.cantitate} RON
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           )}
                       </div>
                   ))}
               </div>
           </div>
       </div>
   );
};

export default VehicleService;