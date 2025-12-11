import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export const MotherLogin = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // MOCK AUTHENTICATION CHECK
    if (!mobile || mobile.length !== 10) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }
    
    // FIX: Set the session authentication flag immediately upon successful demo login.
    sessionStorage.setItem('mother_auth', 'authenticated');
    
    // Simulate login success
    navigate('/mother/dashboard');
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans relative">
      
      {/* --- NEW: Back Button --- */}
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-100 transition-colors z-20 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-bold">Back to ASHA Login</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-full mb-6">
            <Heart className="w-10 h-10 text-pink-500 fill-current" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Urban Mother</h2>
          <p className="text-gray-500 mb-8">Your companion for a healthy journey 🤰</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input 
                type="tel" 
                placeholder="Enter your 10-digit number"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In Securely
            </button>
          </form>

          {/* --- FIXED: Clickable Link --- */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              New here?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-pink-600 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0"
              >
                Register with ASHA
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};