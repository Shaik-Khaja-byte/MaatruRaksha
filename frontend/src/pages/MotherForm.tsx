import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMothers, Mother } from '../contexts/MotherContext'; 
import { ClipboardList, Baby, Calendar, Scale, HeartPulse, Smartphone, CornerDownLeft } from 'lucide-react';

// Define the form state shape based on the Mother type, excluding derived, ID, and context-managed fields
// FIX: Explicitly omit ALL non-form-collected fields (edd, riskLabel, and the 7 fields added for MotherProfile).
type FormState = Omit<Mother, 
    'id' | 'edd' | 'riskLabel' | 
    'lastCallStatus' | 'totalMissedCalls' | 
    'phone' | 'address' | 'last_anc_date' | 
    'gestation_weeks' | 'notes' | 'flagged' | 'visited'
>;

export function MotherForm() {
  const navigate = useNavigate();
  const { addMother, getMotherRiskLabel } = useMothers();

  const [formData, setFormData] = useState<FormState>({
    name: '',
    phoneNumber: '',
    age: 0,
    lmp: '',
    pregnancyNumber: 1,
    weight: 0,
    medicalConditions: '',
    phoneType: 'Smartphone',
    previousComplications: '',
    alternateContact: '',
    familyMemberDetails: '',
    height: null,
    bloodGroup: '',
    specialNotes: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Calculate risk label dynamically for display (demo only)
  const currentRisk = formData.age > 0 && formData.weight > 0 ? getMotherRiskLabel(formData) : null;
  
  const getRiskColor = (label: Mother['riskLabel'] | null) => {
    switch (label) {
      case 'Red': return 'bg-red-100 text-red-700 border-red-300';
      case 'Yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Green': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-500 border-gray-300';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'age' || id === 'pregnancyNumber' || id === 'weight' || id === 'height' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMother(formData);
    setSuccessMessage(`Mother ${formData.name} added successfully! Risk: ${currentRisk}`);
    // Optional: clear form or navigate
    setTimeout(() => {
        navigate('/dashboard'); // Take user to dashboard after success
    }, 1500);
  };

  const renderInputField = (id: keyof FormState, label: string, type: string = 'text', required: boolean = false, icon: React.ReactNode = null, placeholder?: string) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 flex items-center mb-1">
        {icon} <span className="ml-1">{label} {required && <span className="text-pink-600">*</span>}</span>
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={String(formData[id] || '')}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-pink-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-pink-300 outline-none transition duration-150"
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type={type}
          id={id}
          value={String(formData[id] || '')}
          onChange={handleChange}
          className="w-full p-3 border border-pink-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-pink-300 outline-none transition duration-150"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm border border-white/70 rounded-3xl shadow-2xl w-full max-w-4xl p-8 relative">
        <button 
            onClick={() => navigate('/dashboard')} 
            className="absolute top-4 left-4 text-gray-600 hover:text-pink-600 flex items-center transition"
            title="Go back to Dashboard"
        >
            <CornerDownLeft className="w-5 h-5 mr-1"/> Back
        </button>

        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2 tracking-tight flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-pink-600 mr-2" /> 
            Mother Intake Form
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Fill in the details for the new mother. Priority 1 fields are required.
        </p>

        {successMessage && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-center mb-6">
                {successMessage}
            </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
          
          {/* --- Priority 1 (Must Have) --- */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-pink-600 border-b border-pink-200 pb-2 mb-4">Priority 1: Critical Data</h2>
          </div>
          {renderInputField('name', 'Mother\'s Full Name', 'text', true, <Baby className="w-4 h-4" />, 'e.g., Anjali Kumari')}
          {renderInputField('phoneNumber', 'Phone Number', 'tel', true, <Smartphone className="w-4 h-4" />, 'e.g., 9876543210')}
          {renderInputField('age', 'Age', 'number', true, <Calendar className="w-4 h-4" />, 'e.g., 25')}
          {renderInputField('lmp', 'LMP Date (YYYY-MM-DD)', 'date', true, <Calendar className="w-4 h-4" />)}
          {renderInputField('pregnancyNumber', 'Pregnancy Number', 'number', true, <Baby className="w-4 h-4" />, 'e.g., 1 for first pregnancy')}
          {renderInputField('weight', 'Weight (kg)', 'number', true, <Scale className="w-4 h-4" />, 'e.g., 60')}
          {renderInputField('medicalConditions', 'Medical Conditions (Diabetes, BP, etc.)', 'text', true, <HeartPulse className="w-4 h-4" />, 'List conditions, e.g., BP, occasional fever')}

          {/* Phone Type Select Field */}
          <div className="mb-4">
            <label htmlFor="phoneType" className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                <Smartphone className="w-4 h-4" /> <span className="ml-1">Phone Type <span className="text-pink-600">*</span></span>
            </label>
            <select
              id="phoneType"
              value={formData.phoneType}
              onChange={handleChange}
              className="w-full p-3 border border-pink-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-pink-300 outline-none transition duration-150"
              required
            >
              <option value="Smartphone">Smartphone</option>
              <option value="Basic">Basic/Feature Phone</option>
            </select>
          </div>

          {/* --- Priority 2 (Add if time permits) --- */}
          <div className="md:col-span-2 mt-6">
            <h2 className="text-xl font-bold text-rose-500 border-b border-rose-200 pb-2 mb-4">Priority 2: Supplementary Data</h2>
          </div>
          {renderInputField('previousComplications', 'Previous Complications', 'textarea', false)}
          {renderInputField('alternateContact', 'Alternate Contact Number', 'tel', false)}
          {renderInputField('familyMemberDetails', 'Family Member Details (Name/Relationship)', 'text', false)}

          {/* --- Priority 3 (Nice to have) --- */}
          <div className="md:col-span-2 mt-6">
            <h2 className="text-xl font-bold text-purple-500 border-b border-purple-200 pb-2 mb-4">Priority 3: Extra Info</h2>
          </div>
          {renderInputField('height', 'Height (cm)', 'number', false)}
          {renderInputField('bloodGroup', 'Blood Group', 'text', false, null, 'e.g., A+, O-')}
          {renderInputField('specialNotes', 'Special Notes', 'textarea', false)}

          {/* Risk Label Preview and Submit Button */}
          <div className="md:col-span-2 mt-6 flex justify-between items-center">
            <div className={`text-sm font-bold p-3 rounded-xl border transition-all duration-300 ${getRiskColor(currentRisk)}`}>
                Calculated Risk: **{currentRisk || 'Enter P1 Data'}**
            </div>
            <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-500/30 transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                disabled={!formData.name || !formData.phoneNumber || !formData.age || !formData.lmp || !formData.weight} // Simple validation
            >
                Add Mother Record
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}