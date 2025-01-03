// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\holidays\HolidayForm.js
import React, { useState, useEffect } from 'react';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';

const HolidayForm = ({ holiday, onSubmit, drivers }) => {
   const [formData, setFormData] = useState({
       sofer: '',
       tipConcediu: '',
       dataStart: '',
       dataFinal: '',
       motiv: '',
       documente: []
   });

   useEffect(() => {
       if (holiday) {
           setFormData(holiday);
       }
   }, [holiday]);

   const handleSubmit = (e) => {
       e.preventDefault();
       onSubmit(formData);
   };

   return (
       <form onSubmit={handleSubmit} className="space-y-6">
           <Select
               label="Șofer"
               name="sofer"
               value={formData.sofer}
               onChange={(e) => setFormData({...formData, sofer: e.target.value})}
               options={drivers.map(d => ({
                   value: d._id,
                   label: d.nume
               }))}
               required
           />

           <Select
               label="Tip Concediu"
               name="tipConcediu"
               value={formData.tipConcediu}
               onChange={(e) => setFormData({...formData, tipConcediu: e.target.value})}
               options={[
                   { value: 'Intre Curse', label: 'Între Curse' },
                   { value: 'Medical', label: 'Medical' },
                   { value: 'Neplatit', label: 'Neplătit' },
                   { value: 'Special', label: 'Special' }
               ]}
               required
           />

           <div className="grid grid-cols-2 gap-4">
               <FormInput
                   label="Data Start"
                   type="date"
                   name="dataStart"
                   value={formData.dataStart}
                   onChange={(e) => setFormData({...formData, dataStart: e.target.value})}
                   required
               />

               <FormInput
                   label="Data Final"
                   type="date"
                   name="dataFinal"
                   value={formData.dataFinal}
                   onChange={(e) => setFormData({...formData, dataFinal: e.target.value})}
                   required
               />
           </div>

           <FormInput
               label="Motiv"
               name="motiv"
               value={formData.motiv}
               onChange={(e) => setFormData({...formData, motiv: e.target.value})}
               required
           />

           <Button type="submit" variant="primary">
               {holiday ? 'Actualizează' : 'Adaugă'} Concediu
           </Button>
       </form>
   );
};

export default HolidayForm;