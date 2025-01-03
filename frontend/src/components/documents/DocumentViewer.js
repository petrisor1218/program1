// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\documents\DocumentViewer.js
import React from 'react';

const DocumentViewer = ({ document }) => {
   if (!document) return null;

   return (
       <div className="bg-white rounded-lg shadow-lg p-6">
           <div className="mb-4">
               <h3 className="text-lg font-medium">{document.nume}</h3>
               <p className="text-sm text-gray-500">
                   Uploadat la: {new Date(document.dataUpload).toLocaleString()}
               </p>
           </div>

           {document.tip === 'pdf' ? (
               <iframe
                   src={document.url}
                   className="w-full h-[600px]"
                   title={document.nume}
               />
           ) : (
               <img
                   src={document.url}
                   alt={document.nume}
                   className="max-w-full h-auto"
               />
           )}
       </div>
   );
};

export default DocumentViewer;