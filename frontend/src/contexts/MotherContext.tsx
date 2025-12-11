// src/contexts/MotherContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the Mother data structure (FINAL VERSION with all required fields)
export type Mother = {
  id: string; // Unique ID for keying/deletion
  name: string;
  phoneNumber: string;
  age: number;
  lmp: string; // Last Menstrual Period date string (YYYY-MM-DD)
  edd: string; // Estimated Due Date (Calculated)
  pregnancyNumber: number;
  weight: number; // Current weight in kg
  medicalConditions: string; // Comma-separated or JSON string for simplicity
  phoneType: 'Smartphone' | 'Basic';
  previousComplications: string;
  alternateContact: string;
  familyMemberDetails: string;
  height: number | null;
  bloodGroup: string;
  specialNotes: string;
  // NEW FIELDS (For MotherProfile.tsx and Communication Status)
  phone: string; // Added for friend's profile display
  address: string; // Added for friend's profile display
  last_anc_date: string; // Added for friend's profile display
  gestation_weeks: number; // Added for friend's profile display
  notes: string; // Added for friend's profile display
  flagged: boolean; // Added for friend's action buttons
  visited: boolean; // Added for friend's action buttons
  lastCallStatus: 'Answered' | 'Missed (1)' | 'Missed (2+)' | 'N/A';
  totalMissedCalls: number;
  riskLabel: 'Red' | 'Yellow' | 'Green';
};

// Define the Context type 
interface MotherContextType {
  mothers: Mother[];
  addMother: (motherDetails: Omit<Mother, 'id' | 'edd' | 'riskLabel' | 'lastCallStatus' | 'totalMissedCalls' | 'phone' | 'address' | 'last_anc_date' | 'gestation_weeks' | 'notes' | 'flagged' | 'visited'>) => void;
  getMotherRiskLabel: (mother: Omit<Mother, 'id' | 'edd' | 'riskLabel' | 'lastCallStatus' | 'totalMissedCalls' | 'phone' | 'address' | 'last_anc_date' | 'gestation_weeks' | 'notes' | 'flagged' | 'visited'>, totalMissedCalls?: number) => Mother['riskLabel'];
  simulateBulkCall: () => void; 
}

const MotherContext = createContext<MotherContextType | undefined>(undefined);

// Helper function to calculate EDD (Mock calculation for demo)
const calculateEDD = (lmp: string): string => {
  const lmpDate = new Date(lmp);
  // Naegele's rule: LMP + 9 months + 7 days
  lmpDate.setDate(lmpDate.getDate() + 7);
  lmpDate.setMonth(lmpDate.getMonth() + 9);
  return lmpDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// **Combined Risk Assessment Logic**
const determineRiskLabel = (mother: Omit<Mother, 'id' | 'edd' | 'riskLabel' | 'lastCallStatus' | 'totalMissedCalls' | 'phone' | 'address' | 'last_anc_date' | 'gestation_weeks' | 'notes' | 'flagged' | 'visited'>, totalMissedCalls: number = 0): Mother['riskLabel'] => {
  const { medicalConditions, age, pregnancyNumber, weight, previousComplications } = mother;
  let score = 0;

  // --- MEDICAL RISK ---
  const conditions = medicalConditions.toLowerCase();
  if (conditions.includes('diabetes') || conditions.includes('bp') || conditions.includes('high pressure')) {
    score += 3;
  }
  if (age < 18 || age > 35) { score += 2; }
  if (pregnancyNumber > 4) { score += 2; } else if (pregnancyNumber === 1) { score += 1; }
  if (previousComplications && previousComplications.length > 5) { score += 2; }
  if (weight < 40 || weight > 90) { score += 1; }

  // --- COMMUNICATION RISK ---
  if (totalMissedCalls >= 2) { score += 2; } else if (totalMissedCalls === 1) { score += 1; }

  // Assign label based on score
  if (score >= 4) { return 'Red'; } 
  else if (score >= 2) { return 'Yellow'; } 
  else { return 'Green'; }
};

export function MotherProvider({ children }: { children: ReactNode }) {
  // Initial state updated with all fields
  const [mothers, setMothers] = useState<Mother[]>([
    { // Priya Sharma (Green/Low Risk)
      id: 'm-1', name: 'Priya Sharma', phoneNumber: '9876543210', age: 28, lmp: '2025-05-01', edd: calculateEDD('2025-05-01'), pregnancyNumber: 2, weight: 65, medicalConditions: '', phoneType: 'Smartphone', previousComplications: '', alternateContact: '9876543211', familyMemberDetails: 'Husband: Rajesh', height: 160, bloodGroup: 'O+', specialNotes: 'Happy to walk.', 
      phone: '9876543210', address: '123 Gandhi St, Anna Nagar, Chennai', last_anc_date: '2025-11-20', gestation_weeks: 28, notes: 'Patient has no major issues. Stable blood pressure.', flagged: false, visited: true, riskLabel: 'Green', lastCallStatus: 'Answered', totalMissedCalls: 0
    },
    { // Lalita Devi (Red/High Risk - Medical + Communication)
      id: 'm-2', name: 'Lalita Devi', phoneNumber: '8888877777', age: 36, lmp: '2025-04-10', edd: calculateEDD('2025-04-10'), pregnancyNumber: 3, weight: 78, medicalConditions: 'High BP, Diabetes', phoneType: 'Basic', previousComplications: 'Pre-eclampsia in last pregnancy', alternateContact: '8888877778', familyMemberDetails: 'Mother: Sunita', height: 155, bloodGroup: 'A-', specialNotes: 'Needs frequent check-ups.', 
      phone: '8888877777', address: '45/A, Nehru Colony, Adyar, Chennai', last_anc_date: '2025-11-01', gestation_weeks: 34, notes: 'Struggling with medication adherence. Needs home visit ASAP.', flagged: true, visited: false, riskLabel: 'Red', lastCallStatus: 'Missed (2+)', totalMissedCalls: 3
    },
    { // Geeta Singh (Yellow/Moderate Risk - Age/First Pregnancy)
      id: 'm-3', name: 'Geeta Singh', phoneNumber: '7777766666', age: 22, lmp: '2025-06-15', edd: calculateEDD('2025-06-15'), pregnancyNumber: 1, weight: 42, medicalConditions: 'None', phoneType: 'Smartphone', previousComplications: '', alternateContact: '7777766667', familyMemberDetails: 'Sister: Aarti', height: 168, bloodGroup: 'B+', specialNotes: 'First time mom, anxious.', 
      phone: '7777766666', address: '60, Market Road, T Nagar, Chennai', last_anc_date: '2025-11-25', gestation_weeks: 24, notes: 'Weight is low, advised high protein diet.', flagged: false, visited: true, riskLabel: 'Yellow', lastCallStatus: 'Answered', totalMissedCalls: 0
    }
  ]);

  const getUpdatedRiskLabel = (mother: Mother): Mother['riskLabel'] => {
      // Create a temporary object matching the required input format
      const tempMother: Omit<Mother, 'id' | 'edd' | 'riskLabel' | 'lastCallStatus' | 'totalMissedCalls' | 'phone' | 'address' | 'last_anc_date' | 'gestation_weeks' | 'notes' | 'flagged' | 'visited'> = mother;
      return determineRiskLabel(tempMother, mother.totalMissedCalls);
  }

  const addMother = (motherDetails: Omit<Mother, 'id' | 'edd' | 'riskLabel' | 'lastCallStatus' | 'totalMissedCalls' | 'phone' | 'address' | 'last_anc_date' | 'gestation_weeks' | 'notes' | 'flagged' | 'visited'>) => {
    // 1. Calculate the initial risk based on medical data
    const initialRiskLabel = determineRiskLabel(motherDetails, 0); 
    
    const newMother: Mother = {
      ...motherDetails,
      id: `m-${Date.now()}`,
      edd: calculateEDD(motherDetails.lmp),
      // Default values for the new properties
      phone: motherDetails.phoneNumber,
      address: 'Address needed',
      last_anc_date: new Date().toISOString().split('T')[0],
      gestation_weeks: 12, // Default start gestation
      notes: '',
      flagged: false,
      visited: false,
      // Default communication status
      lastCallStatus: 'N/A', 
      totalMissedCalls: 0,
      riskLabel: initialRiskLabel, // FIX APPLIED: Include riskLabel here
    };
    
    setMothers(prev => [...prev, newMother]);
  };

  const simulateBulkCall = () => {
    setMothers(prevMothers => prevMothers.map(mother => {
      // 1. Determine if the mother answers the call (Mock logic)
      const didAnswer = Math.random() > 0.4; // 60% chance to answer

      let newTotalMissedCalls = mother.totalMissedCalls;
      let newLastCallStatus: Mother['lastCallStatus'] = 'N/A';

      if (didAnswer) {
        newLastCallStatus = 'Answered';
        newTotalMissedCalls = 0; // Reset missed calls on answer
      } else {
        newTotalMissedCalls += 1;
        newLastCallStatus = newTotalMissedCalls >= 2 ? 'Missed (2+)' : 'Missed (1)';
      }

      // 2. Re-calculate risk with the new communication status
      const updatedMother = {
        ...mother,
        totalMissedCalls: newTotalMissedCalls,
        lastCallStatus: newLastCallStatus,
      };

      // Recalculate combined risk
      updatedMother.riskLabel = getUpdatedRiskLabel(updatedMother);

      return updatedMother;
    }));
  };


  const contextValue: MotherContextType = {
    mothers,
    addMother,
    getMotherRiskLabel: determineRiskLabel,
    simulateBulkCall, // Expose the new function
  };

  return (
    <MotherContext.Provider value={contextValue}>
      {children}
    </MotherContext.Provider>
  );
}

// Custom hook to use the mother context
export function useMothers() {
  const context = useContext(MotherContext);
  if (context === undefined) {
    throw new Error('useMothers must be used within a MotherProvider');
  }
  return context;
}