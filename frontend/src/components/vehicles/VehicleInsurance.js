// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleInsurance.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';

const VehicleInsurance = ({ vehicleId }) => {
   const [insuranceData, setInsuranceData] = useState({
       polite: {
           RCA: {
               numarPolita: '',
               dataStart: '',
               dataExpirare: '',
               societate: '',
               valoare: 0,
               activ: true
           },
           CASCO: {
               numarPolita: '',
               dataStart: '', 
               dataExpirare: '',
               societate: '',
               valoare: 0,
               activ: true,
               acoperire: []
           },
           CMR: {
               numarPolita: '',
               dataStart: '',
               dataExpirare: '',
               societate: '',
               valoare: 0,
               activ: true,
               limitaAcoperire: 0
           }
       },
       daune: [],
       istoriaDaunelor: [],
       dauneCurente: []
   });

   const [newDauna, setNewDauna] = useState({
       dataIncident: '',
       tip: '',
       descriere: '',
       locatie: '',
       prejudiciu: 0,
       statusDosar: 'deschis',
       numarDosar: '',
       partiImplicate: [],
       documente: []
   });

   useEffect(() => {
       if(vehicleId) {
           loadInsuranceData();
       }
   }, [vehicleId]);

   const loadInsuranceData = async () => {
       try {
           const response = await api.get(`/vehicles/${vehicleId}/insurance`);
           setInsuranceData(response.data);
       } catch (error) {
           console.error('Error loading insurance data:', error);
       }
   };

   const handleAddDauna = async (e) => {
       e.preventDefault();
       try {
           await api.post(`/vehicles/${vehicleId}/insurance/claims`, newDauna);
           loadInsuranceData();
           setNewDauna({
               dataIncident: '',
               tip: '',
               descriere: '',
               locatie: '',
               prejudiciu: 0,
               statusDosar: 'deschis',
               numarDosar: '',
               partiImplicate: [],
               documente: []
           });
       } catch (error) {
           console.error('Error adding claim:', error);
       }
   };

   const handleUpdateDauna = async (daunaId, statusNou) => {
       try {
           await api.patch(`/vehicles/${vehicleId}/insurance/claims/${daunaId}`, {
               status: statusNou
           });
           loadInsuranceData();
       } catch (error) {
           console.error('Error updating claim:', error);
       }
   };

   return (
       <div className="space-y-6">
           {/* Polițe Active */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <PolitaCard
                   title="RCA"
                   data={insuranceData.polite.RCA}
               />
               <PolitaCard
                   title="CASCO"
                   data={insuranceData.polite.CASCO}
               />
               <PolitaCard
                   title="CMR"
                   data={insuranceData.polite.CMR}
               />
           </div>

           {/* Adaugă Daună Nouă */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Înregistrare Daună Nouă</h3>
               <form onSubmit={handleAddDauna} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <FormInput
                           label="Data Incident"
                           type="date"
                           value={newDauna.dataIncident}
                           onChange={e => setNewDauna({
                               ...newDauna,
                               dataIncident: e.target.value
                           })}
                           required
                       />
                       <Select
                           label="Tip Daună"
                           value={newDauna.tip}
                           onChange={e => setNewDauna({
                               ...newDauna,
                               tip: e.target.value
                           })}
                           options={[
                               { value: 'accident', label: 'Accident' },
                               { value: 'furt', label: 'Furt' },
                               { value: 'vandalism', label: 'Vandalism' },
                               { value: 'calamitate', label: 'Calamitate Naturală' }
                           ]}
                           required
                       />
                       <FormInput
                           label="Locație"
                           value={newDauna.locatie}
                           onChange={e => setNewDauna({
                               ...newDauna,
                               locatie: e.target.value
                           })}
                           required
                       />
                   </div>

                   <FormInput
                       label="Descriere Incident"
                       value={newDauna.descriere}
                       onChange={e => setNewDauna({
                           ...newDauna,
                           descriere: e.target.value
                       })}
                       multiline
                       rows={3}
                       required
                   />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <FormInput
                           label="Prejudiciu Estimat (RON)"
                           type="number"
                           value={newDauna.prejudiciu}
                           onChange={e => setNewDauna({
                               ...newDauna,
                               prejudiciu: e.target.value
                           })}
                       />
                       <FormInput
                           label="Număr Dosar"
                           value={newDauna.numarDosar}
                           onChange={e => setNewDauna({
                               ...newDauna,
                               numarDosar: e.target.value
                           })}
                       />
                   </div>

                   <Button type="submit" variant="primary">
                       Înregistrează Daună
                   </Button>
               </form>
           </div>

           {/* Daune în Curs */}
           {insuranceData.dauneCurente.length > 0 && (
               <div className="bg-white p-6 rounded-lg shadow">
                   <h3 className="text-lg font-medium mb-4">Daune în Curs</h3>
                   <div className="space-y-4">
                       {insuranceData.dauneCurente.map((dauna, index) => (
                           <DaunaCard
                               key={index}
                               dauna={dauna}
                               onUpdateStatus={handleUpdateDauna}
                           />
                       ))}
                   </div>
               </div>
           )}

           {/* Istoric Daune */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Istoric Daune</h3>
               <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                       <thead>
                           <tr>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Data
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Tip
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Status
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Prejudiciu
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Detalii
                               </th>
                           </tr>
                       </thead>
                       <tbody>
                           {insuranceData.istoriaDaunelor.map((dauna, index) => (
                               <tr key={index} className="bg-white">
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       {formatDate(dauna.dataIncident)}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       {dauna.tip}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <span className={`px-2 py-1 rounded-full text-xs ${
                                           dauna.status === 'inchis' ? 'bg-green-100 text-green-800' :
                                           dauna.status === 'respins' ? 'bg-red-100 text-red-800' :
                                           'bg-yellow-100 text-yellow-800'
                                       }`}>
                                           {dauna.status}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       {dauna.prejudiciu} RON
                                   </td>
                                   <td className="px-6 py-4">
                                       {dauna.descriere}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
       </div>
   );
};

const PolitaCard = ({ title, data }) => {
   const isExpired = new Date(data.dataExpirare) < new Date();
   const isExpiringSoon = new Date(data.dataExpirare) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

   return (
       <div className={`p-6 rounded-lg ${
           isExpired ? 'bg-red-50' :
           isExpiringSoon ? 'bg-yellow-50' :
           'bg-green-50'
       }`}>
           <div className="flex justify-between items-start">
               <h3 className="font-medium">{title}</h3>
               <span className={`px-2 py-1 rounded-full text-xs ${
                   isExpired ? 'bg-red-100 text-red-800' :
                   isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                   'bg-green-100 text-green-800'
               }`}>
                   {isExpired ? 'Expirat' : isExpiringSoon ? 'Expiră curând' : 'Activ'}
               </span>
           </div>
           
           <div className="mt-4 space-y-2">
               <p className="text-sm">Număr: {data.numarPolita}</p>
               <p className="text-sm">Societate: {data.societate}</p>
               <p className="text-sm">Valoare: {data.valoare} RON</p>
               <p className="text-sm">
                   Expiră: <span className={
                       isExpired ? 'text-red-600' :
                       isExpiringSoon ? 'text-yellow-600' :
                       'text-green-600'
                   }>
                       {formatDate(data.dataExpirare)}
                   </span>
               </p>
           </div>
       </div>
   );
};

const DaunaCard = ({ dauna, onUpdateStatus }) => (
   <div className="border-l-4 border-blue-500 pl-4 py-2">
       <div className="flex justify-between items-start">
           <div>
               <p className="font-medium">{dauna.tip} - {formatDate(dauna.dataIncident)}</p>
               <p className="text-sm text-gray-500">
                   Dosar: {dauna.numarDosar}
               </p>
               <p className="mt-1">{dauna.descriere}</p>
           </div>
           <div className="text-right">
               <p className="font-medium">{dauna.prejudiciu} RON</p>
               <div className="mt-2">
                   <Button
                       variant="success"
                       size="sm"
                       onClick={() => onUpdateStatus(dauna._id, 'inchis')}
                   >
                       Închide Dosar
                   </Button>
               </div>
           </div>
       </div>
       {dauna.partiImplicate?.length > 0 && (
           <div className="mt-2">
               <p className="text-sm text-gray-500">Părți implicate:</p>
               <ul className="text-sm">
                   {dauna.partiImplicate.map((parte, idx) => (
                       <li key={idx}>
                           {parte.nume} - {parte.tip}
                       </li>
                   ))}
               </ul>
           </div>
       )}
   </div>
);

export default VehicleInsurance;