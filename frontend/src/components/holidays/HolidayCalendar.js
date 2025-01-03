// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\holidays\HolidayCalendar.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const HolidayCalendar = () => {
   const [holidays, setHolidays] = useState([]);
   const [currentMonth, setCurrentMonth] = useState(new Date());

   useEffect(() => {
       loadHolidays();
   }, [currentMonth]);

   const loadHolidays = async () => {
       const response = await api.get('/holidays', {
           params: {
               month: currentMonth.getMonth() + 1,
               year: currentMonth.getFullYear()
           }
       });
       setHolidays(response.data);
   };

   const getDaysInMonth = (date) => {
       const year = date.getFullYear();
       const month = date.getMonth();
       return new Date(year, month + 1, 0).getDate();
   };

   const getCalendarDays = () => {
       const daysInMonth = getDaysInMonth(currentMonth);
       return Array.from({ length: daysInMonth }, (_, i) => i + 1);
   };

   return (
       <div className="bg-white shadow rounded-lg p-6">
           <div className="flex justify-between mb-4">
               <button
                   onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
               >
                   ←
               </button>
               <h3 className="text-lg font-medium">
                   {currentMonth.toLocaleString('ro-RO', { month: 'long', year: 'numeric' })}
               </h3>
               <button
                   onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
               >
                   →
               </button>
           </div>

           <div className="grid grid-cols-7 gap-1">
               {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                   <div key={day} className="text-center font-medium p-2">
                       {day}
                   </div>
               ))}
               {getCalendarDays().map(day => {
                   const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                   const holidaysForDay = holidays.filter(h => 
                       new Date(h.dataStart) <= currentDate && 
                       new Date(h.dataFinal) >= currentDate
                   );

                   return (
                       <div
                           key={day}
                           className={`
                               p-2 border rounded-lg
                               ${holidaysForDay.length > 0 ? 'bg-blue-50' : ''}
                           `}
                       >
                           <div className="text-right">{day}</div>
                           {holidaysForDay.map(holiday => (
                               <div
                                   key={holiday._id}
                                   className="text-xs p-1 mt-1 rounded bg-blue-100"
                               >
                                   {holiday.sofer.nume}
                               </div>
                           ))}
                       </div>
                   );
               })}
           </div>
       </div>
   );
};

export default HolidayCalendar;