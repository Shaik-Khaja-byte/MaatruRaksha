// src/pages/Dashboard.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMothers, Mother } from '../contexts/MotherContext';
import { useNavigate } from 'react-router-dom';
import { ListChecks, UserPlus, Heart, LogOut, PhoneCall } from 'lucide-react';

// Helper component for the Mother cards
const MotherCard: React.FC<{ mother: Mother, navigate: (path: string) => void }> = ({ mother, navigate }) => {
    const getLabelClasses = (label: Mother['riskLabel']) => {
        switch (label) {
            case 'Red': return 'bg-red-500 text-white';
            case 'Yellow': return 'bg-yellow-400 text-gray-800';
            case 'Green': return 'bg-green-500 text-white';
            default: return 'bg-gray-400 text-white';
        }
    };
    
    const getCallStatusBadge = (status: Mother['lastCallStatus']) => {
        switch (status) {
            case 'Answered': return 'bg-green-100 text-green-700';
            case 'Missed (1)': return 'bg-yellow-100 text-yellow-700';
            case 'Missed (2+)': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }


    return (
        <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-b-4 border-pink-200 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{mother.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getLabelClasses(mother.riskLabel)}`}>
                        {mother.riskLabel} Risk
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">EDD:</span> **{mother.edd}**
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>
                        <span className="font-medium">Conditions:</span> {mother.medicalConditions || 'None reported'}
                    </p>
                    <p className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="font-medium">Last Contact:</span> 
                        <span className={`px-2 py-0.5 text-xs rounded-lg font-semibold ${getCallStatusBadge(mother.lastCallStatus)}`}>
                            {mother.lastCallStatus}
                        </span>
                    </p>
                </div>
            </div>
            <button 
                // FIX: Navigate to the new Mother Profile page
                onClick={() => navigate(`/mother/${mother.id}`)}
                className="mt-4 w-full bg-pink-100 text-pink-600 font-semibold py-2 rounded-lg hover:bg-pink-200 transition text-sm"
            >
                View Full Record
            </button>
        </div>
    );
};


export function Dashboard() {
    const { logout } = useAuth();
    const { mothers, simulateBulkCall } = useMothers(); // Destructure new function
    const navigate = useNavigate();
    const [calling, setCalling] = useState(false);

    // Filter mothers by risk for display
    const redMothers = mothers.filter(m => m.riskLabel === 'Red');
    const yellowMothers = mothers.filter(m => m.riskLabel === 'Yellow');
    const greenMothers = mothers.filter(m => m.riskLabel === 'Green');

    const handleSimulateCall = async () => {
        setCalling(true);
        // Simulate network/calling delay
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        simulateBulkCall(); // Run the context function to update risk/call status
        setCalling(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Actions */}
                <div className="flex justify-between items-center pb-6 mb-8 border-b-4 border-pink-300/50">
                    <h1 className="text-4xl font-extrabold text-gray-800 flex items-center tracking-tight">
                        <Heart className="w-8 h-8 text-pink-600 mr-3 fill-pink-600" />
                        ASHA Dashboard
                    </h1>
                    <div className="flex gap-4">
                        {/* NEW: Simulate Call Button */}
                        <button 
                            onClick={handleSimulateCall}
                            disabled={calling}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center transition-transform hover:scale-[1.02] disabled:opacity-50"
                            title="Simulates attempting to contact all mothers."
                        >
                            {calling ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Calling...
                                </span>
                            ) : (
                                <>
                                    <PhoneCall className="w-5 h-5 mr-2" /> 
                                    **Simulate Call & Update Status**
                                </>
                            )}
                        </button>

                        <button 
                            onClick={() => navigate('/add-mother')}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center transition-transform hover:scale-[1.02]"
                        >
                            <UserPlus className="w-5 h-5 mr-2" /> **Add New Mother**
                        </button>
                        <button 
                            onClick={() => { logout(); navigate('/login'); }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl flex items-center transition"
                        >
                            <LogOut className="w-5 h-5 mr-2" /> Logout
                        </button>
                    </div>
                </div>

                {/* --- Risk Categories --- */}
                
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                    <ListChecks className="w-6 h-6 mr-2"/> Red Risk: Immediate Attention ({redMothers.length})
                </h2>
                <p className="text-gray-600 mb-4">Mothers with critical medical or communication risks (missed 2+ calls).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {redMothers.length > 0 ? (
                        redMothers.map(mother => <MotherCard key={mother.id} mother={mother} navigate={navigate} />)
                    ) : (
                        <p className="md:col-span-3 text-gray-500 italic">No red risk mothers currently. Great work!</p>
                    )}
                </div>

                <div className="border-t border-dashed border-rose-300 pt-6 mt-6"></div>

                <h2 className="text-2xl font-bold text-yellow-700 mb-4 flex items-center">
                    <ListChecks className="w-6 h-6 mr-2"/> Yellow Risk: Close Monitoring ({yellowMothers.length})
                </h2>
                <p className="text-gray-600 mb-4">Mothers with minor risks or missed 1 call.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {yellowMothers.length > 0 ? (
                        yellowMothers.map(mother => <MotherCard key={mother.id} mother={mother} navigate={navigate} />)
                    ) : (
                        <p className="md:col-span-3 text-gray-500 italic">No yellow risk mothers currently.</p>
                    )}
                </div>

                <div className="border-t border-dashed border-green-300 pt-6 mt-6"></div>
                
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                    <ListChecks className="w-6 h-6 mr-2"/> Green Risk: Routine Care ({greenMothers.length})
                </h2>
                <p className="text-gray-600 mb-4">Mothers with no significant risk factors identified.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {greenMothers.length > 0 ? (
                        greenMothers.map(mother => <MotherCard key={mother.id} mother={mother} navigate={navigate} />)
                    ) : (
                        <p className="md:col-span-3 text-gray-500 italic">All mothers are at high or moderate risk. Please update your records!</p>
                    )}
                </div>
            </div>
        </div>
    );
}