// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleForm.js
import React, { useState, useEffect } from 'react';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const VehicleForm = ({ vehicle, onSubmit }) => {
   const [formData, setFormData] = useState({
       id: '',
       nume: '',
       tip: '',
       kmCurent: '',
       dataAchizitie: '',
       documente: {
           ITP: '',
           RCA: '',
           CopieConforma: '',
           RevizieTaho: '',
           ExpirareLicenta: ''
       }
   });

   useEffect(() => {
       if (vehicle) {
           setFormData(vehicle);
       }
   }, [vehicle]);

   const handleSubmit = (e) => {
       e.preventDefault();
       onSubmit(formData);
   };

   const handleChange = (e) => {
       const { name, value } = e.target;
       if (name.includes('.')) {
           const [parent, child] = name.split('.');
           setFormData(prev => ({
               ...prev,
               [parent]: {
                   ...prev[parent],
                   [child]: value
               }
           }));
       } else {
           setFormData(prev => ({
               ...prev,
               [name]: value
           }));
       }
   };

   return (
       <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormInput
                   label="ID"
                   name="id"
                   value={formData.id}
                   onChange={handleChange}
                   required
               />
               <FormInput
                   label="Nume"
                   name="nume"
                   value={formData.nume}
                   onChange={handleChange}
                   required
               />
               <Select
                   label="Tip"
                   name="tip"
                   value={formData.tip}
                   onChange={handleChange}
                   options={[
                       { value: 'camioane', label: 'Camion' },
                       { value: 'trailere', label: 'Trailer' }
                   ]}
                   required
               />
               <FormInput
                   label="Kilometri"
                   name="kmCurent"
                   type="number"
                   value={formData.kmCurent}
                   onChange={handleChange}
                   required
               />
               <FormInput
                   label="Data Achiziție"
                   name="dataAchizitie"
                   type="date"
                   value={formData.dataAchizitie}
                   onChange={handleChange}
                   required
               />
           </div>

           <h3 className="text-lg font-medium mt-6">Documente</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormInput
                   label="ITP"
                   name="documente.ITP"
                   type="date"
                   value={formData.documente.ITP}
                   onChange={handleChange}
               />
               <FormInput
                   label="RCA"
                   name="documente.RCA"
                   type="date"
                   value={formData.documente.RCA}
                   onChange={handleChange}
               />
               <FormInput
                   label="Copie Conformă"
                   name="documente.CopieConforma"
                   type="date"
                   value={formData.documente.CopieConforma}
                   onChange={handleChange}
               />
               <FormInput
                   label="Revizie Tahograf"
                   name="documente.RevizieTaho"
                   type="date"
                   value={formData.documente.RevizieTaho}
                   onChange={handleChange}
               />
               <FormInput
                   label="Expirare Licență"
                   name="documente.ExpirareLicenta"
                   type="date"
                   value={formData.documente.ExpirareLicenta}
                   onChange={handleChange}
               />
           </div>

           <div className="flex justify-end">
               <Button type="submit" variant="primary">
                   {vehicle ? 'Actualizează' : 'Adaugă'} Vehicul
               </Button>
           </div>
       </form>
   );
};

export default VehicleForm;