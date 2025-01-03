import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';
import Select from '../shared/forms/Select';

const DriverDiurna = ({ driverId }) => {
   const [diurnaData, setDiurnaData] = useState({
       lunaCurenta: {
           zile: 0,
           suma: 0,
           perioade: []
       },
       anCurent: {
           zile: 0,
           suma: 0,
           lunarBreakdown: []
       }
   });

   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

   useEffect(() => {
       if (driverId) loadDiurnaData();
   }, [driverId, selectedYear, selectedMonth]);

   const loadDiurnaData = async () => {
    try {
        const response = await driversAPI.getDiurna(driverId, {
            year: selectedYear,
            month: selectedMonth
        });
        setDiurnaData(response.data);
    } catch (error) {
        console.error('Error loading diurna data:', error);
    }
};

   return (
       <div className="space-y-6">
           {/* Filtre perioadă */}
           <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
               <Select
                   value={selectedYear}
                   onChange={e => setSelectedYear(parseInt(e.target.value))}
                   options={[
                       { value: 2024, label: '2024' },
                       { value: 2023, label: '2023' }
                   ]}
                   className="w-32"
               />
               <Select
                   value={selectedMonth}
                   onChange={e => setSelectedMonth(parseInt(e.target.value))}
                   options={[
                       { value: 1, label: 'Ianuarie' },
                       { value: 2, label: 'Februarie' },
                       { value: 3, label: 'Martie' },
                       { value: 4, label: 'Aprilie' },
                       { value: 5, label: 'Mai' },
                       { value: 6, label: 'Iunie' },
                       { value: 7, label: 'Iulie' },
                       { value: 8, label: 'August' },
                       { value: 9, label: 'Septembrie' },
                       { value: 10, label: 'Octombrie' },
                       { value: 11, label: 'Noiembrie' },
                       { value: 12, label: 'Decembrie' }
                   ]}
                   className="w-48"
               />
           </div>

           {/* Sumar luna curentă */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Luna Curentă</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                   <div>
                       <p className="text-sm text-gray-500">Total Zile</p>
                       <p className="text-2xl font-bold">{diurnaData.lunaCurenta.zile}</p>
                   </div>
                   <div>
                       <p className="text-sm text-gray-500">Total Diurnă</p>
                       <p className="text-2xl font-bold">{diurnaData.lunaCurenta.suma} EUR</p>
                   </div>
               </div>

               <div className="space-y-2">
                   {diurnaData.lunaCurenta.perioade.map((perioada, index) => (
                       <div 
                           key={index}
                           className="border-l-4 border-blue-500 pl-4 py-2"
                       >
                           <div className="flex justify-between">
                               <div>
                                   <p className="font-medium">
                                       {formatDate(perioada.dataStart)} - {formatDate(perioada.dataFinal)}
                                   </p>
                                   <p className="text-sm text-gray-500">
                                       {perioada.zile} zile - {perioada.zonaCurse}
                                   </p>
                               </div>
                               <p className="font-medium">{perioada.suma} EUR</p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Total an */}
           <div className="bg-white p-6 rounded-lg shadow">
               <h3 className="text-lg font-medium mb-4">Total An {selectedYear}</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                   <div>
                       <p className="text-sm text-gray-500">Total Zile An</p>
                       <p className="text-2xl font-bold">{diurnaData.anCurent.zile}</p>
                   </div>
                   <div>
                       <p className="text-sm text-gray-500">Total Diurnă An</p>
                       <p className="text-2xl font-bold">{diurnaData.anCurent.suma} EUR</p>
                   </div>
               </div>

               <div className="overflow-x-auto">
                   <table className="min-w-full">
                       <thead>
                           <tr>
                               <th className="text-left">Luna</th>
                               <th className="text-left">Zile</th>
                               <th className="text-left">Diurnă</th>
                           </tr>
                       </thead>
                       <tbody>
                           {diurnaData.anCurent.lunarBreakdown.map((luna, index) => (
                               <tr key={index} className="border-b">
                                   <td className="py-2">{luna.luna}</td>
                                   <td className="py-2">{luna.zile}</td>
                                   <td className="py-2">{luna.suma} EUR</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>

           {/* Butoane acțiuni */}
           <div className="flex gap-4">
               <Button
                   variant="primary"
                   onClick={() => {
                       // Export to Excel/PDF
                   }}
               >
                   Exportă Raport
               </Button>
           </div>
       </div>
   );
};

export default DriverDiurna;