// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\dashboard\RecentActivity.js
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { dashboardAPI } from '../../services/api'
import { formatDate } from '../../utils/dateUtils'

export function RecentActivity() {
 const [activities, setActivities] = useState([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
   loadData()
 }, [])

 const loadData = async () => {
   try {
     const response = await dashboardAPI.getActivity()
     setActivities(response.data)
   } catch (error) {
     console.error('Error loading activities:', error)
   } finally {
     setLoading(false)
   }
 }

 if (loading) {
   return (
     <Card>
       <CardHeader>
         <CardTitle>Activitate Recentă</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="animate-pulse space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="h-14 bg-gray-200 rounded"></div>
           ))}
         </div>
       </CardContent>
     </Card>
   )
 }

 return (
   <Card>
     <CardHeader>
       <CardTitle>Activitate Recentă</CardTitle>
     </CardHeader>
     <CardContent>
       <div className="space-y-4">
         {activities.map((activity) => (
           <div key={activity.id} className="flex justify-between items-start p-4 border-b last:border-0">
             <div>
               <p className="font-medium text-sm">{activity.detalii}</p>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs text-muted-foreground">
                   {formatDate(activity.dataPrincipala)}
                 </span>
                 <span className="text-xs text-muted-foreground">•</span>
                 <span className="text-xs text-muted-foreground">
                   {activity.utilizator}
                 </span>
               </div>
             </div>
             <span className={`px-2 py-1 text-xs rounded-full ${
               activity.importanta === 'High' 
                 ? 'bg-red-100 text-red-800' 
                 : activity.importanta === 'Medium'
                 ? 'bg-yellow-100 text-yellow-800'
                 : 'bg-gray-100 text-gray-600'
             }`}>
               {activity.tipEntitate}
             </span>
           </div>
         ))}
       </div>
     </CardContent>
   </Card>
 )
}