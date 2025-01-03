// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleTracker.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const VehicleTracker = ({ vehicleId }) => {
   const [vehicleData, setVehicleData] = useState({
       documente: {
           ITP: {
               dataExpirare: '',
               stare: 'valid' // valid, expira curand, expirat
           },
           RCA: {
               dataExpirare: '',
               stare: 'valid'
           },
           Tahograf: {
               dataExpirare: '',
               stare: 'valid'
           },
           LicentaTransport: {
               dataExpirare: '',
               stare: 'valid'
           }
       },
       service: {
           ultimulService: {
               data: '',
               km: 0,
               tip: ''
           },
           urmatoareaRevizie: {
               data: '',
               kmEstimati: 0
           },
           reparatiiProgramate: []
       },
       soferCurent: {
           id: '',
           nume: '',
           dataAsignare: ''
       },
       kmCurenti: 0,
       mediaKmZilnici: 0,
       consumCarburant: []
   });

   useEffect(() => {
       if (vehicleId) {
           loadVehicleData();
       }
   }, [vehicleId]);

   const loadVehicleData = async () => {
       try {
           const response = await api.get(`/vehicles/${vehicleId}/tracking`);
           setVehicleData(response.data);
       } catch (error) {
           console.error('Error loading vehicle data:', error);
       }
   };

   // Actualizare km
   const updateKm = async (newKm) => {
       await api.post(`/vehicles/${vehicleId}/km`, { km: newKm });
       loadVehicleData();
   };

   // Programare service
   const scheduleService = async (serviceData) => {
       await api.post(`/vehicles/${vehicleId}/service/schedule`, serviceData);
       loadVehicleData();
   };

   return (
       <div className="space-y-6">
           {/* Info Bază */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <InfoCard
                   title="Kilometri Actuali"
                   value={`${vehicleData.kmCurenti} km`}
               />
               <InfoCard
                   title="Media Zilnică"
                   value={`${vehicleData.mediaKmZilnici} km/zi`}
               />
               <InfoCard
                   title="Șofer Actual"
                   value={vehicleData.soferCurent.nume || 'Neasignat'}
               />
               <InfoCard
                   title="Ultimul Service"
                   value={formatDate(vehicleData.service.ultimulService.data)}
                   subtitle={`${vehicleData.service.ultimulService.km} km`}
               />
           </div>

           {/* Documente Status */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Status Documente</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {Object.entries(vehicleData.documente).map(([key, doc]) => (
                       <DocumentStatus
                           key={key}
                           title={key}
                           data={doc.dataExpirare}
                           status={doc.stare}
                       />
                   ))}
               </div>
           </div>

           {/* Service Tracking */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Service & Mentenanță</h3>
               <div className="space-y-4">
                   <div className="flex justify-between items-center p-4 bg-blue-50 rounded">
                       <div>
                           <p className="text-sm text-blue-600">Următoarea Revizie</p>
                           <p className="font-medium">{formatDate(vehicleData.service.urmatoareaRevizie.data)}</p>
                           <p className="text-sm text-blue-600">
                               Estimare: {vehicleData.service.urmatoareaRevizie.kmEstimati} km
                           </p>
                       </div>
                       <button className="px-4 py-2 bg-blue-600 text-white rounded">
                           Programează
                       </button>
                   </div>

                   <div className="mt-4">
                       <h4 className="font-medium mb-2">Reparații Programate</h4>
                       {vehicleData.service.reparatiiProgramate.map((reparatie, index) => (
                           <div 
                               key={index}
                               className="flex justify-between items-center border-b py-2"
                           >
                               <div>
                                   <p className="font-medium">{reparatie.descriere}</p>
                                   <p className="text-sm text-gray-500">
                                       {formatDate(reparatie.dataProgramata)}
                                   </p>
                               </div>
                               <span className={`px-2 py-1 rounded-full text-xs ${
                                   reparatie.prioritate === 'urgent' 
                                       ? 'bg-red-100 text-red-800'
                                       : 'bg-yellow-100 text-yellow-800'
                               }`}>
                                   {reparatie.prioritate}
                               </span>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* Consum Carburant */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Consum Carburant</h3>
               <div className="overflow-x-auto">
                   <table className="min-w-full">
                       <thead>
                           <tr>
                               <th className="text-left">Data</th>
                               <th className="text-left">Km</th>
                               <th className="text-left">Litri</th>
                               <th className="text-left">Consum Mediu</th>
                           </tr>
                       </thead>
                       <tbody>
                           {vehicleData.consumCarburant.map((consum, index) => (
                               <tr key={index}>
                                   <td>{formatDate(consum.data)}</td>
                                   <td>{consum.km}</td>
                                   <td>{consum.litri}</td>
                                   <td>{consum.consumMediu} l/100km</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       </div>
   );
};

const InfoCard = ({ title, value, subtitle }) => (
   <div className="bg-white p-4 rounded-lg shadow">
       <p className="text-sm text-gray-500">{title}</p>
       <p className="text-xl font-bold">{value}</p>
       {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
   </div>
);

const DocumentStatus = ({ title, data, status }) => {
   const statusStyles = {
       valid: 'bg-green-100 text-green-800',
       'expira curand': 'bg-yellow-100 text-yellow-800',
       expirat: 'bg-red-100 text-red-800'
   };

   return (
       <div className="p-4 rounded-lg bg-gray-50">
           <p className="font-medium">{title}</p>
           <p className="text-sm text-gray-500">{formatDate(data)}</p>
           <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusStyles[status]}`}>
               {status}
           </span>
       </div>
   );
};

export default VehicleTracker;