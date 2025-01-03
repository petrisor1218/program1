// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\dashboard\DriverStatus.js
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { dashboardAPI } from '../../services/api'

export function DriverStatus() {
   const [drivers, setDrivers] = useState([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
       loadData()
   }, [])

   const loadData = async () => {
       try {
           const response = await dashboardAPI.getDriverStatus()
           setDrivers(response.data)
       } catch (error) {
           console.error('Error loading drivers:', error)
       } finally {
           setLoading(false)
       }
   }

   if (loading) {
       return (
           <Card>
               <CardHeader>
                   <CardTitle>Status Șoferi</CardTitle>
               </CardHeader>
               <CardContent>
                   <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                       {[1,2,3].map(i => (
                           <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                       ))}
                   </div>
               </CardContent>
           </Card>
       )
   }

   return (
       <Card>
           <CardHeader>
               <CardTitle>Status Șoferi</CardTitle>
           </CardHeader>
           <CardContent>
               <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                   {drivers.map((driver) => (
                       <div key={driver.id} className="flex items-center justify-between p-4 rounded-lg border">
                           <div>
                               <p className="font-medium">{driver.nume}</p>
                               <p className="text-sm text-muted-foreground">
                                   {driver.vehiculAsignat?.numarInmatriculare || 'Neasignat'}
                               </p>
                           </div>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               driver.status === 'Activ'
                                   ? 'bg-green-100 text-green-800'
                                   : driver.status === 'Concediu'
                                   ? 'bg-yellow-100 text-yellow-800'
                                   : 'bg-gray-100 text-gray-800'
                           }`}>
                               {driver.status}
                           </span>
                       </div>
                   ))}
               </div>
           </CardContent>
       </Card>
   )
}