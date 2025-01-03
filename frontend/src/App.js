import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import DriverList from './components/drivers/DriverList';
import VehicleList from './components/vehicles/VehicleList';
import Holidays from './components/holidays/Holidays';
import Salaries from './components/salaries/Salaries';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/drivers" element={<DriverList />} />
                    <Route path="/vehicles" element={<VehicleList />} />
                    <Route path="/holidays" element={<Holidays />} />
                    <Route path="/salaries" element={<Salaries />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;