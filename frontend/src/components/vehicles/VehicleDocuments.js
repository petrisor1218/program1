// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleDocuments.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';

const VehicleDocuments = ({ vehicleId }) => {
   const [documents, setDocuments] = useState({
       ITP: {
           dataEmitere: '',
           dataExpirare: '',
           documente: [],
           observatii: ''
       },
       RCA: {
           dataEmitere: '',
           dataExpirare: '', 
           numarPolita: '',
           societateAsigurare: '',
           documente: [],
           observatii: ''
       },
       Tahograf: {
           dataUltimaVerificare: '',
           dataUrmatoareVerificare: '',
           numarCertificat: '',
           documente: [],
           observatii: ''
       },
       LicentaTransport: {
           serie: '',
           numar: '',
           dataEmitere: '',
           dataExpirare: '',
           documente: [],
           observatii: ''
       },
       CopieConforma: {
           serie: '',
           numar: '',
           dataEmitere: '',
           dataExpirare: '',
           documente: [],
           observatii: ''
       },
       CASCO: {
           dataEmitere: '',
           dataExpirare: '',
           numarPolita: '',
           societateAsigurare: '',
           documente: [],
           observatii: ''
       }
   });

   const [editMode, setEditMode] = useState(false);
   const [notifications, setNotifications] = useState([]);

   useEffect(() => {
       if(vehicleId) {
           loadDocuments();
           loadNotifications();
       }
   }, [vehicleId]);

   const loadDocuments = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/documents`);
       setDocuments(response.data);
   };

   const loadNotifications = async () => {
       const response = await api.get(`/vehicles/${vehicleId}/documents/notifications`);
       setNotifications(response.data);
   };

   const handleSave = async (docType, data) => {
       await api.patch(`/vehicles/${vehicleId}/documents/${docType}`, data);
       loadDocuments();
       loadNotifications();
   };

   const handleFileUpload = async (docType, file) => {
       const formData = new FormData();
       formData.append('document', file);
       await api.post(`/vehicles/${vehicleId}/documents/${docType}/upload`, formData);
       loadDocuments();
   };

   return (
       <div className="space-y-6">
           {/* Notificări */}
           {notifications.length > 0 && (
               <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                   <div className="flex">
                       <div className="flex-shrink-0">
                           <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                           </svg>
                       </div>
                       <div className="ml-3">
                           <p className="text-sm text-yellow-700">
                               {notifications.length} documente necesită atenție
                           </p>
                           <ul className="mt-2 text-sm text-yellow-700">
                               {notifications.map((notif, index) => (
                                   <li key={index}>{notif.message}</li>
                               ))}
                           </ul>
                       </div>
                   </div>
               </div>
           )}

           {/* Documente */}
           {Object.entries(documents).map(([docType, data]) => (
               <DocumentSection
                   key={docType}
                   title={docType}
                   data={data}
                   onSave={(updatedData) => handleSave(docType, updatedData)}
                   onUpload={(file) => handleFileUpload(docType, file)}
                   editMode={editMode}
               />
           ))}

           <div className="flex justify-end">
               <Button 
                   variant={editMode ? "primary" : "secondary"}
                   onClick={() => setEditMode(!editMode)}
               >
                   {editMode ? 'Salvează' : 'Editează'}
               </Button>
           </div>
       </div>
   );
};

const DocumentSection = ({ title, data, onSave, onUpload, editMode }) => {
   const [formData, setFormData] = useState(data);
   const isExpired = new Date(data.dataExpirare) < new Date();
   const isExpiringSoon = new Date(data.dataExpirare) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

   const handleChange = (field, value) => {
       setFormData(prev => ({
           ...prev,
           [field]: value
       }));
   };

   const handleSubmit = (e) => {
       e.preventDefault();
       onSave(formData);
   };

   return (
       <div className={`bg-white p-6 rounded-lg shadow ${
           isExpired ? 'border-l-4 border-red-500' :
           isExpiringSoon ? 'border-l-4 border-yellow-500' :
           ''
       }`}>
           <div className="flex justify-between items-start mb-4">
               <h3 className="text-lg font-medium">{title}</h3>
               <span className={`px-2 py-1 rounded-full text-xs ${
                   isExpired ? 'bg-red-100 text-red-800' :
                   isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                   'bg-green-100 text-green-800'
               }`}>
                   {isExpired ? 'Expirat' : 
                    isExpiringSoon ? 'Expiră curând' : 
                    'Valid'}
               </span>
           </div>

           {editMode ? (
               <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {data.serie !== undefined && (
                           <FormInput
                               label="Serie"
                               value={formData.serie}
                               onChange={e => handleChange('serie', e.target.value)}
                           />
                       )}
                       {data.numar !== undefined && (
                           <FormInput
                               label="Număr"
                               value={formData.numar}
                               onChange={e => handleChange('numar', e.target.value)}
                           />
                       )}
                       {data.numarPolita !== undefined && (
                           <FormInput
                               label="Număr Poliță"
                               value={formData.numarPolita}
                               onChange={e => handleChange('numarPolita', e.target.value)}
                           />
                       )}
                       {data.societateAsigurare !== undefined && (
                           <FormInput
                               label="Societate Asigurare"
                               value={formData.societateAsigurare}
                               onChange={e => handleChange('societateAsigurare', e.target.value)}
                           />
                       )}
                       <FormInput
                           label="Data Emitere"
                           type="date"
                           value={formData.dataEmitere}
                           onChange={e => handleChange('dataEmitere', e.target.value)}
                       />
                       <FormInput
                           label="Data Expirare"
                           type="date"
                           value={formData.dataExpirare}
                           onChange={e => handleChange('dataExpirare', e.target.value)}
                       />
                   </div>

                   <FormInput
                       label="Observații"
                       value={formData.observatii}
                       onChange={e => handleChange('observatii', e.target.value)}
                       multiline
                       rows={2}
                   />
               </form>
           ) : (
               <div className="space-y-2">
                   {data.serie && <p>Serie: <span className="font-medium">{data.serie}</span></p>}
                   {data.numar && <p>Număr: <span className="font-medium">{data.numar}</span></p>}
                   {data.numarPolita && <p>Număr Poliță: <span className="font-medium">{data.numarPolita}</span></p>}
                   {data.societateAsigurare && <p>Societate: <span className="font-medium">{data.societateAsigurare}</span></p>}
                   <p>Emis: <span className="font-medium">{formatDate(data.dataEmitere)}</span></p>
                   <p>Expiră: <span className="font-medium">{formatDate(data.dataExpirare)}</span></p>
                   {data.observatii && (
                       <p className="text-gray-600 text-sm mt-2">{data.observatii}</p>
                   )}
               </div>
           )}

           {/* Documente atașate */}
           <div className="mt-4">
               <div className="flex justify-between items-center mb-2">
                   <p className="text-sm font-medium">Documente atașate</p>
                   <input
                       type="file"
                       onChange={(e) => onUpload(e.target.files[0])}
                       className="hidden"
                       id={`file-${title}`}
                   />
                   <label
                       htmlFor={`file-${title}`}
                       className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                   >
                       + Adaugă document
                   </label>
               </div>
               {data.documente.length > 0 ? (
                   <ul className="space-y-1">
                       {data.documente.map((doc, index) => (
                           <li key={index} className="flex justify-between items-center text-sm">
                               <a 
                                   href={doc.url} 
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-blue-600 hover:underline"
                               >
                                   {doc.nume}
                               </a>
                               <span className="text-gray-500">
                                   {formatDate(doc.dataIncarcare)}
                               </span>
                           </li>
                       ))}
                   </ul>
               ) : (
                   <p className="text-sm text-gray-500">Nu există documente atașate</p>
               )}
           </div>
       </div>
   );
};

export default VehicleDocuments;