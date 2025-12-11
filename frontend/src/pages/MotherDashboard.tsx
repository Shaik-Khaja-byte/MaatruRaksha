// src/pages/MotherDashboard.tsx

import { useState } from 'react'; // FIXED: Removed unused 'React' and 'useEffect' from imports
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Calendar as CalendarIcon, Home, Activity, User, 
  AlertCircle, CheckCircle2, Circle, Plus, Pill, ChevronRight, LogOut 
} from 'lucide-react';

// --- Types ---
interface Task {
  id: number;
  title: string;
  subtitle: string;
  completed: boolean;
  type: 'med' | 'general'; // To know if it affects medicine stock
}

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  stock: number;
}

export const MotherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showConfetti, setShowConfetti] = useState(false);

  // --- State (Simulating Database) ---
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Take iron tablet", subtitle: "After breakfast", completed: false, type: 'med' },
    { id: 2, title: "Log how you're feeling", subtitle: "Daily Check-in", completed: false, type: 'general' },
    { id: 3, title: "Drink Water", subtitle: "2 Liters goal", completed: false, type: 'general' },
  ]);

  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 1, name: "Iron & Folic Acid", dosage: "1 Tablet daily", stock: 30 },
    { id: 2, name: "Calcium", dosage: "1 Tablet after lunch", stock: 15 },
  ]);

  // Tracks which days meds were taken (YYYY-MM-DD)
  const [medHistory, setMedHistory] = useState<string[]>([]);

  // Calculate Progress
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  // --- Actions ---

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Toggle logic
    const isNowCompleted = !task.completed;
    
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: isNowCompleted } : t
    ));

    // Logic: If it's a medicine task and we just checked it
    if (task.type === 'med' && isNowCompleted) {
      // 1. Record history for Calendar (Today's date)
      const today = new Date().toISOString().split('T')[0];
      if (!medHistory.includes(today)) {
        setMedHistory([...medHistory, today]);
      }
      
      // 2. Reduce Stock logic could go here if we linked specific meds to specific tasks
      // For now, we just visually show it's done.
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const addMedicine = () => {
    const name = prompt("Enter Medicine Name:");
    if (name) {
      const newMed: Medicine = {
        id: Date.now(),
        name: name,
        dosage: "As prescribed",
        stock: 10 // Default starter stock
      };
      setMedicines([...medicines, newMed]);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mother_auth'); 
    if(window.confirm("Are you sure you want to logout?")) {
      navigate('/mother/login'); // Redirects to login
    }
  };

  const handleSOS = () => {
    const confirmed = window.confirm("🚨 EMERGENCY SOS 🚨\n\nTrigger emergency alert to ASHA Worker & Family?");
    if (confirmed) {
      alert("🚑 HELP SENT! Location shared with Dr. Sharma and Husband.");
    }
  };

  // --- Components ---

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2 font-bold text-gray-600">
        <span>Daily Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Main Status Card */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transform transition hover:scale-[1.01]">
        <div className="relative z-10">
          <p className="text-pink-100 text-sm mb-1">Countdown</p>
          <h2 className="text-4xl font-bold mb-2">16 Weeks</h2>
          <p className="opacity-90">until delivery (April 15)</p>
          <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">Trimester 2</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">Healthy</span>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
      </div>

      {/* 2. Progress & Tasks */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Today's Checklist</h3>
        <ProgressBar />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="p-4 border-b border-gray-50 flex justify-between items-center cursor-pointer transition-colors hover:bg-gray-50 group"
            >
              <div className="flex items-center gap-4">
                {task.completed ? (
                  <CheckCircle2 className="w-7 h-7 text-green-500 fill-green-50 transition-transform transform scale-110" />
                ) : (
                  <Circle className="w-7 h-7 text-gray-300 group-hover:text-pink-400 transition-colors" />
                )}
                
                <div>
                  <p className={`font-semibold text-lg ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">{task.subtitle}</p>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Upcoming Appointment */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-amber-800">Next ANC Checkup</h4>
          <p className="text-sm text-amber-700 mt-1">Dec 15 (7 days away) at City Hospital</p>
          <button className="mt-2 text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg">Set Reminder</button>
        </div>
      </div>
    </div>
  );

  const renderMeds = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
         <Activity className="w-12 h-12 text-pink-500 mx-auto mb-2" />
         <h2 className="text-xl font-bold text-gray-800">Medicine Tracker</h2>
         <p className="text-gray-500 text-sm">Manage your prescriptions and stock.</p>
         <button 
           onClick={addMedicine}
           className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 mx-auto"
         >
           <Plus className="w-4 h-4" /> Add New Medicine
         </button>
      </div>

      <div className="grid gap-4">
        {medicines.map(med => (
          <div key={med.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-500 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="bg-pink-50 p-2 rounded-full">
                 <Pill className="w-6 h-6 text-pink-500" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-800">{med.name}</h3>
                 <p className="text-xs text-gray-500">{med.dosage}</p>
               </div>
             </div>
             <div className="text-right">
                <p className="text-sm font-bold text-gray-700">{med.stock} left</p>
                <button 
                  onClick={() => {
                    setMedicines(medicines.map(m => m.id === med.id ? {...m, stock: m.stock - 1} : m))
                  }}
                  className="text-xs text-pink-600 font-semibold bg-pink-50 px-2 py-1 rounded mt-1"
                >
                  Take 1
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => {
    // Generate dummy days for the calendar
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const today = new Date().getDate();

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-in slide-in-from-right duration-300">
        <div className="text-center mb-6">
          <CalendarIcon className="w-12 h-12 text-pink-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">Consistency Streak</h2>
          <p className="text-gray-500 text-sm">Pink days mean you took your meds!</p>
        </div>

        {/* Big Calendar Grid */}
        <div className="grid grid-cols-5 gap-3">
          {days.map(day => {
            // Logic: Randomly simulate past history for demo purposes, OR use real history
            // For this demo, let's say days 1, 2, 3, 5, 6, 8 are "Pink" (Taken)
            // In a real app, check medHistory
            const isTaken = [1, 2, 3, 5, 6, 8, today].includes(day); 
            const isToday = day === today;
            
            return (
              <div 
                key={day}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center font-bold text-lg border-2 transition-all
                  ${isTaken ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}
                  ${isToday ? 'ring-4 ring-pink-200 transform scale-110 z-10' : ''}
                `}
              >
                {day}
                {isTaken && <div className="mt-1 w-1.5 h-1.5 bg-white rounded-full"></div>}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-200">
          <strong>⚠ Alert:</strong> You missed your Calcium tablet on Day 4 and Day 7. Please stay consistent!
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="animate-in slide-in-from-right duration-300">
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-200 to-rose-300 rounded-full flex items-center justify-center text-3xl shadow-inner">
             👩‍🍼
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Priya Sharma</h2>
            <p className="text-pink-600 font-medium">+91 98765 43210</p>
            <p className="text-xs text-gray-400 mt-1">ID: UM-2025-889</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: "My Health Records", action: () => alert("Opening Health Records PDF...") },
          { label: "Emergency Contacts", action: () => alert("Husband: +91 999...\nDoctor: +91 888...") },
          { label: "Pregnancy Diet Plan", action: () => alert("Opening Diet Plan...") },
          { label: "Baby Kick History", action: () => alert("Opening Kick Charts...") }
        ].map((item, idx) => (
          <div 
            key={idx}
            onClick={item.action}
            className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            <span className="font-semibold text-gray-700">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 p-5 rounded-xl shadow-sm flex justify-between items-center cursor-pointer hover:bg-red-100 mt-6 transition-colors border border-red-100"
        >
          <span className="font-bold">Logout</span>
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans selection:bg-pink-100">
      
      {/* Confetti Effect (Simple Overlay) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hi, Priya! 👋</h1>
          <p className="text-xs text-gray-500">Week 24 • Baby is size of corn 🌽</p>
        </div>
        <div className="bg-gray-100 p-2 rounded-full relative cursor-pointer hover:bg-gray-200 transition">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
      </header>

      {/* Dynamic Content Main Area */}
      <main className="p-4 max-w-lg mx-auto">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'meds' && renderMeds()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* SOS Button (Always Floating) */}
      <button 
        onClick={handleSOS}
        className="fixed bottom-24 right-4 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-xl shadow-red-200 z-50 animate-pulse active:scale-90 transition-transform"
      >
        <span className="font-bold text-xs">SOS</span>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-50 max-w-lg mx-auto left-0 right-0">
        <NavButton 
          icon={Home} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <NavButton 
          icon={Activity} 
          label="Meds" 
          active={activeTab === 'meds'} 
          onClick={() => setActiveTab('meds')} 
        />
        <NavButton 
          icon={CalendarIcon} 
          label="Calendar" 
          active={activeTab === 'calendar'} 
          onClick={() => setActiveTab('calendar')} 
        />
        <NavButton 
          icon={User} 
          label="Profile" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
      </nav>
    </div>
  );
};

// Helper Component for Navigation Buttons
const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-full transition-colors ${active ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);