// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleDetails.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';

const VehicleDetails = ({ vehicleId }) => {
   const [vehicle, setVehicle] = useState(null);
   const [serviceHistory, setServiceHistory] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
       if (vehicleId) {
           loadVehicleData();
       }
   }, [vehicleId]);

   const loadVehicleData = async () => {
       try {
           const [vehicleRes, serviceRes] = await Promise.all([
               api.get(`/vehicles/${vehicleId}`),
               api.get(`/vehicles/${vehicleId}/service`)
           ]);
           setVehicle(vehicleRes.data);
           setServiceHistory(serviceRes.data);
       } catch (error) {
           console.error('Error loading vehicle data:', error);
       } finally {
           setLoading(false);
       }
   };

   if (loading) return <div>Loading...</div>;
   if (!vehicle) return <div>Vehicle not found</div>;

   return (
       <div className="space-y-6">
           <div className="bg-white shadow rounded-lg p-6">
               <h2 className="text-2xl font-bold mb-4">{vehicle.nume}</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <InfoCard label="ID" value={vehicle.id} />
                   <InfoCard label="Tip" value={vehicle.tip} />
                   <InfoCard label="KM Curent" value={`${vehicle.kmCurent} km`} />
                   <InfoCard 
                       label="Data Achiziție" 
                       value={formatDate(vehicle.dataAchizitie)} 
                   />
               </div>
           </div>

           <div className="bg-white shadow rounded-lg p-6">
               <h3 className="text-xl font-bold mb-4">Documente</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   <DocumentCard 
                       label="ITP" 
                       date={vehicle.documente.ITP}
                   />
                   <DocumentCard 
                       label="RCA" 
                       date={vehicle.documente.RCA}
                   />
                   <DocumentCard 
                       label="Copie Conformă" 
                       date={vehicle.documente.CopieConforma}
                   />
                   <DocumentCard 
                       label="Revizie Tahograf" 
                       date={vehicle.documente.RevizieTaho}
                   />
                   <DocumentCard 
                       label="Licență" 
                       date={vehicle.documente.ExpirareLicenta}
                   />
               </div>
           </div>

           <div className="bg-white shadow rounded-lg p-6">
               <h3 className="text-xl font-bold mb-4">Istoric Service</h3>
               <table className="min-w-full">
                   <thead>
                       <tr>
                           <th className="text-left">Data</th>
                           <th className="text-left">Tip</th>
                           <th className="text-left">KM</th>
                           <th className="text-left">Cost</th>
                           <th className="text-left">Detalii</th>
                       </tr>
                   </thead>
                   <tbody>
                       {serviceHistory.map((entry) => (
                           <tr key={entry.id}>
                               <td>{formatDate(entry.date)}</td>
                               <td>{entry.type}</td>
                               <td>{entry.km}</td>
                               <td>{entry.cost} RON</td>
                               <td>{entry.details}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
   );
};

const InfoCard = ({ label, value }) => (
   <div className="p-4 bg-gray-50 rounded">
       <p className="text-sm text-gray-500">{label}</p>
       <p className="font-medium">{value}</p>
   </div>
);

const DocumentCard = ({ label, date }) => {
   const isExpired = new Date(date) < new Date();
   const isExpiringSoon = new Date(date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

   return (
       <div className={`p-4 rounded ${
           isExpired ? 'bg-red-50' :
           isExpiringSoon ? 'bg-yellow-50' :
           'bg-green-50'
       }`}>
           <p className="text-sm text-gray-500">{label}</p>
           <p className={`font-medium ${
               isExpired ? 'text-red-700' :
               isExpiringSoon ? 'text-yellow-700' :
               'text-green-700'
           }`}>
               {formatDate(date)}
           </p>
       </div>
   );
};

export default VehicleDetails;