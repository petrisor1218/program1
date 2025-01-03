// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\documents\DocumentList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../shared/tables/DataTable';

const DocumentList = () => {
   const [documents, setDocuments] = useState([]);
   const columns = [
       { key: 'tip', label: 'Tip Document' },
       { key: 'numar', label: 'Număr' },
       { key: 'dataEmitere', label: 'Data Emitere', 
         render: date => new Date(date).toLocaleDateString() },
       { key: 'dataExpirare', label: 'Data Expirare', 
         render: date => new Date(date).toLocaleDateString() },
       { key: 'status', label: 'Status' }
   ];

   useEffect(() => {
       loadDocuments();
   }, []);

   const loadDocuments = async () => {
       const response = await api.get('/documents');
       setDocuments(response.data);
   };

   return <DataTable data={documents} columns={columns} />;
};

export default DocumentList;