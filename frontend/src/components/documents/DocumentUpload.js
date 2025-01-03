// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\documents\DocumentUpload.js
import React, { useState } from 'react';
import api from '../../services/api';

const DocumentUpload = ({ entityId, entityType, onUploadComplete }) => {
   const [file, setFile] = useState(null);
   const [loading, setLoading] = useState(false);

   const handleUpload = async (e) => {
       e.preventDefault();
       if (!file) return;

       const formData = new FormData();
       formData.append('document', file);
       formData.append('entityId', entityId);
       formData.append('entityType', entityType);

       setLoading(true);
       try {
           await api.post('/documents/upload', formData);
           onUploadComplete?.();
       } catch (error) {
           console.error('Upload error:', error);
       } finally {
           setLoading(false);
       }
   };

   return (
       <form onSubmit={handleUpload} className="space-y-4">
           <input
               type="file"
               onChange={(e) => setFile(e.target.files[0])}
               className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
           />
           <button
               type="submit"
               disabled={!file || loading}
               className="bg-blue-500 text-white px-4 py-2 rounded 
                        disabled:opacity-50 disabled:cursor-not-allowed"
           >
               {loading ? 'Se încarcă...' : 'Încarcă Document'}
           </button>
       </form>
   );
};

export default DocumentUpload;