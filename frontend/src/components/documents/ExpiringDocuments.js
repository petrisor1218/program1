// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\documents\ExpiringDocuments.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ExpiringDocuments = () => {
   const [documents, setDocuments] = useState([]);

   useEffect(() => {
       loadExpiringDocs();
   }, []);

   const loadExpiringDocs = async () => {
       const response = await api.get('/documents/expiring');
       setDocuments(response.data);
   };

   return (
       <div className="space-y-4">
           {documents.map(doc => (
               <div key={doc._id} className="border p-4 rounded">
                   <div className="flex justify-between">
                       <div>
                           <h4 className="font-medium">{doc.tip}</h4>
                           <p className="text-sm text-gray-500">
                               {doc.numar}
                           </p>
                       </div>
                       <div className="text-right">
                           <p className="text-sm">Expiră la:</p>
                           <p className={`font-medium ${
                               new Date(doc.dataExpirare) < new Date()
                                   ? 'text-red-600'
                                   : 'text-yellow-600'
                           }`}>
                               {new Date(doc.dataExpirare).toLocaleDateString()}
                           </p>
                       </div>
                   </div>
               </div>
           ))}
       </div>
   );
};

export default ExpiringDocuments;