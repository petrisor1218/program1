import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';

const DriverDocuments = ({ driverId }) => {
    const [documents, setDocuments] = useState({
        permisConducere: {
            serie: '',
            numar: '',
            dataExpirare: '',
            categorii: [],
            documentUrl: ''
        },
        cardTahograf: {
            serie: '',
            dataExpirare: '',
            documentUrl: ''
        },
        atestatProfesional: {
            serie: '',
            numar: '',
            dataExpirare: '',
            documentUrl: ''
        },
        fisMedical: {
            data: '',
            dataExpirare: '',
            documentUrl: ''
        },
        avizPsihologic: {
            data: '',
            dataExpirare: '',
            documentUrl: ''
        },
        contractMunca: {
            numar: '',
            data: '',
            documentUrl: ''
        }
    });

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (driverId) loadDocuments();
    }, [driverId]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await driversAPI.getDocuments(driverId);
            setDocuments(response.data);
            setError(null);
        } catch (error) {
            console.error('Error loading documents:', error);
            setError('Eroare la încărcarea documentelor');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (type, file) => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', type);

            await driversAPI.uploadDocument(driverId, formData);
            await loadDocuments();
            setError(null);
        } catch (error) {
            console.error('Error uploading document:', error);
            setError('Eroare la încărcarea documentului');
        }
    };

    const handleSave = async () => {
        try {
            await driversAPI.updateDocuments(driverId, documents);
            setEditMode(false);
            await loadDocuments();
            setError(null);
        } catch (error) {
            console.error('Error saving documents:', error);
            setError('Eroare la salvarea documentelor');
        }
    };

   return (
       <div className="space-y-6">
           {/* Permis Conducere */}
           <DocumentSection
               title="Permis Conducere"
               data={documents.permisConducere}
               editMode={editMode}
               onChange={(value) => setDocuments({
                   ...documents,
                   permisConducere: value
               })}
               onUpload={(file) => handleUpload('permisConducere', file)}
           />

           {/* Card Tahograf */}
           <DocumentSection
               title="Card Tahograf"
               data={documents.cardTahograf}
               editMode={editMode}
               onChange={(value) => setDocuments({
                   ...documents,
                   cardTahograf: value
               })}
               onUpload={(file) => handleUpload('cardTahograf', file)}
           />

           {/* Atestat Profesional */}
           <DocumentSection
               title="Atestat Profesional"
               data={documents.atestatProfesional}
               editMode={editMode}
               onChange={(value) => setDocuments({
                   ...documents,
                   atestatProfesional: value
               })}
               onUpload={(file) => handleUpload('atestatProfesional', file)}
           />

           {/* Fișă Medicală */}
           <DocumentSection
               title="Fișă Medicală"
               data={documents.fisMedical}
               editMode={editMode}
               onChange={(value) => setDocuments({
                   ...documents,
                   fisMedical: value
               })}
               onUpload={(file) => handleUpload('fisMedical', file)}
           />

           {/* Aviz Psihologic */}
           <DocumentSection
               title="Aviz Psihologic"
               data={documents.avizPsihologic}
               editMode={editMode}
               onChange={(value) => setDocuments({
                   ...documents,
                   avizPsihologic: value
               })}
               onUpload={(file) => handleUpload('avizPsihologic', file)}
           />

           <div className="flex justify-end gap-4">
               {editMode ? (
                   <>
                       <Button
                           variant="secondary"
                           onClick={() => setEditMode(false)}
                       >
                           Anulează
                       </Button>
                       <Button
                           variant="primary"
                           onClick={handleSave}
                       >
                           Salvează
                       </Button>
                   </>
               ) : (
                   <Button
                       variant="primary"
                       onClick={() => setEditMode(true)}
                   >
                       Editează
                   </Button>
               )}
           </div>
       </div>
   );
};

const DocumentSection = ({ title, data, editMode, onChange, onUpload }) => {
   const isExpired = data.dataExpirare && new Date(data.dataExpirare) < new Date();
   const isExpiringSoon = data.dataExpirare && 
       new Date(data.dataExpirare) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

   return (
       <div className={`bg-white p-6 rounded-lg shadow ${
           isExpired ? 'border-l-4 border-red-500' :
           isExpiringSoon ? 'border-l-4 border-yellow-500' :
           ''
       }`}>
           <h3 className="text-lg font-medium mb-4">{title}</h3>
           
           {editMode ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {data.serie !== undefined && (
                       <FormInput
                           label="Serie"
                           value={data.serie}
                           onChange={e => onChange({
                               ...data,
                               serie: e.target.value
                           })}
                       />
                   )}
                   
                   {data.numar !== undefined && (
                       <FormInput
                           label="Număr"
                           value={data.numar}
                           onChange={e => onChange({
                               ...data,
                               numar: e.target.value
                           })}
                       />
                   )}

                   {data.data !== undefined && (
                       <FormInput
                           label="Data"
                           type="date"
                           value={data.data}
                           onChange={e => onChange({
                               ...data,
                               data: e.target.value
                           })}
                       />
                   )}

                   <FormInput
                       label="Data Expirare"
                       type="date"
                       value={data.dataExpirare}
                       onChange={e => onChange({
                           ...data,
                           dataExpirare: e.target.value
                       })}
                   />
               </div>
           ) : (
               <div className="space-y-2">
                   {data.serie && (
                       <p>Serie: <span className="font-medium">{data.serie}</span></p>
                   )}
                   {data.numar && (
                       <p>Număr: <span className="font-medium">{data.numar}</span></p>
                   )}
                   {data.data && (
                       <p>Data: <span className="font-medium">{formatDate(data.data)}</span></p>
                   )}
                   <p>Expiră: <span className={`font-medium ${
                       isExpired ? 'text-red-600' :
                       isExpiringSoon ? 'text-yellow-600' :
                       'text-green-600'
                   }`}>
                       {formatDate(data.dataExpirare)}
                   </span></p>
               </div>
           )}

           <div className="mt-4">
               <input
                   type="file"
                   onChange={e => onUpload(e.target.files[0])}
                   className="hidden"
                   id={`file-${title}`}
               />
               <label
                   htmlFor={`file-${title}`}
                   className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 
                            text-sm font-medium rounded-md text-gray-700 bg-white 
                            hover:bg-gray-50 focus:outline-none"
               >
                   Încarcă Document
               </label>
               {data.documentUrl && (
                   
                       href={data.documentUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="ml-4 text-blue-600 hover:underline"
                   >
                       Vezi Document
                    </a>
               )}
           </div>
       </div>
   );
};

export default DriverDocuments;