// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\holidays\HolidayDetails.js
import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';

const HolidayDetails = ({ holiday, onApprove, onReject }) => {
   if (!holiday) return null;

   return (
       <div className="space-y-6">
           <div className="bg-white shadow rounded-lg p-6">
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <p className="text-sm text-gray-500">Șofer</p>
                       <p className="font-medium">{holiday.sofer?.nume}</p>
                   </div>
                   <div>
                       <p className="text-sm text-gray-500">Tip Concediu</p>
                       <p className="font-medium">{holiday.tipConcediu}</p>
                   </div>
                   <div>
                       <p className="text-sm text-gray-500">Perioada</p>
                       <p className="font-medium">
                           {formatDate(holiday.dataStart)} - {formatDate(holiday.dataFinal)}
                       </p>
                   </div>
                   <div>
                       <p className="text-sm text-gray-500">Status</p>
                       <p className="font-medium">{holiday.status}</p>
                   </div>
               </div>

               <div className="mt-4">
                   <p className="text-sm text-gray-500">Motiv</p>
                   <p className="font-medium">{holiday.motiv}</p>
               </div>

               {holiday.status === 'Solicitat' && (
                   <div className="mt-6 flex gap-4">
                       <Button
                           variant="success"
                           onClick={() => onApprove(holiday._id)}
                       >
                           Aprobă
                       </Button>
                       <Button
                           variant="danger"
                           onClick={() => onReject(holiday._id)}
                       >
                           Respinge
                       </Button>
                   </div>
               )}
           </div>
       </div>
   );
};

export default HolidayDetails;