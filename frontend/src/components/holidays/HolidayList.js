// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\holidays\HolidayList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../shared/tables/DataTable';
import Button from '../shared/buttons/Button';
import { formatDate, calculateDays } from '../../utils/dateUtils';

const HolidayList = () => {
   const [holidays, setHolidays] = useState([]);

   const columns = [
       {
           key: 'sofer',
           label: 'Șofer',
           render: sofer => sofer?.nume
       },
       {
           key: 'dataStart',
           label: 'Data Start',
           render: date => formatDate(date)
       },
       {
           key: 'dataFinal',
           label: 'Data Final',
           render: date => formatDate(date)
       },
       {
           key: 'status',
           label: 'Status'
       },
       {
           key: 'zileTotale',
           label: 'Zile'
       }
   ];

   useEffect(() => {
       loadHolidays();
   }, []);

   const loadHolidays = async () => {
       const response = await api.get('/holidays');
       setHolidays(response.data);
   };

   return (
       <div className="space-y-4">
           <div className="flex justify-between">
               <h2 className="text-2xl font-bold">Concedii</h2>
               <Button 
                   variant="primary"
                   onClick={() => {}}
               >
                   Adaugă Concediu
               </Button>
           </div>
           <DataTable 
               data={holidays}
               columns={columns}
               onRowClick={() => {}}
           />
       </div>
   );
};

export default HolidayList;