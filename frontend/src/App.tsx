// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MotherProvider } from './contexts/MotherContext'; 
import { Login } from './pages/Login'; 
import { Dashboard } from './pages/Dashboard'; 
import { MotherForm } from './pages/MotherForm'; 
import { MotherProfile } from './pages/MotherProfile'; 
// NEW IMPORTS for Urban Mother Flow
import { MotherLogin } from './pages/MotherLogin'; 
import { MotherDashboard } from './pages/MotherDashboard'; 


// 1. ASHA Worker Private Route
const AshaPrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { asha, loading } = useAuth(); 

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-pink-600 font-bold">Loading...</div>;
    }
    
    return asha ? children : <Navigate to="/login" replace />;
};

// 2. Urban Mother Private Route (Mock Auth based on sessionStorage)
const MotherPrivateRoute = ({ children }: { children: JSX.Element }) => {
    // Check for the mock session identifier set by MotherLogin.tsx
    const isAuthenticated = sessionStorage.getItem('mother_auth') === 'authenticated';
    return isAuthenticated ? children : <Navigate to="/mother/login" replace />;
};


export default function App() {
    return (
        <AuthProvider>
            <MotherProvider>
                <BrowserRouter>
                    <Routes>
                        {/* -------------------------------------- */}
                        {/* 1. ASHA WORKER ROUTES (Protected by AshaPrivateRoute) */}
                        {/* -------------------------------------- */}
                        <Route path="/login" element={<Login />} />
                        
                        <Route path="/dashboard" element={
                            <AshaPrivateRoute>
                                <Dashboard />
                            </AshaPrivateRoute>
                        } />
                        <Route path="/add-mother" element={
                            <AshaPrivateRoute>
                                <MotherForm />
                            </AshaPrivateRoute>
                        } />
                        <Route path="/mother/:id" element={
                            <AshaPrivateRoute>
                                <MotherProfile />
                            </AshaPrivateRoute>
                        } />

                        {/* -------------------------------------- */}
                        {/* 2. URBAN MOTHER ROUTES (Protected by MotherPrivateRoute) */}
                        {/* -------------------------------------- */}
                        <Route path="/mother/login" element={<MotherLogin />} />
                        <Route path="/mother/dashboard" element={
                            <MotherPrivateRoute>
                                <MotherDashboard />
                            </MotherPrivateRoute>
                        } />

                        {/* Default redirect (ASHA is the primary entry point) */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </MotherProvider>
        </AuthProvider>
    );
}