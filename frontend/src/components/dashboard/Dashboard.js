// frontend/src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Activity, Users, Truck, Calendar } from 'lucide-react'
import { dashboardAPI } from '../../services/api'
import { RecentActivity } from './RecentActivity'
import { ExpiringDocuments } from './ExpiringDocuments'
import { DriverStatus } from './DriverStatus'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    driversOnHoliday: 0,
    totalVehicles: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Șoferi"
          value={stats.totalDrivers}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Șoferi Activi"
          value={stats.activeDrivers}
          icon={<Activity className="h-5 w-5 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatsCard
          title="În Concediu"
          value={stats.driversOnHoliday}
          icon={<Calendar className="h-5 w-5 text-yellow-600" />}
          bgColor="bg-yellow-50"
        />
        <StatsCard
          title="Total Vehicule"
          value={stats.totalVehicles}
          icon={<Truck className="h-5 w-5 text-purple-600" />}
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentActivity />
        </div>
        <div className="lg:col-span-3">
          <ExpiringDocuments />
        </div>
      </div>

      <DriverStatus />
    </div>
  )
}

const StatsCard = ({ title, value, icon, bgColor }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}