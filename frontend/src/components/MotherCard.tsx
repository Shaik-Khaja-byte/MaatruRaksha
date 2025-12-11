import { User, Phone, Calendar, AlertCircle, PhoneCall } from 'lucide-react';
import { Mother, mothersAPI } from '../lib/api';
import { useState } from 'react';

interface MotherCardProps {
  mother: Mother;
  onView: (id: string) => void;
  onMarkVisited: (id: string) => void;
  onCallTriggered?: () => void;
}

export function MotherCard({ mother, onView, onMarkVisited, onCallTriggered }: MotherCardProps) {
  const [calling, setCalling] = useState(false);
  const [callResult, setCallResult] = useState<string | null>(null);

  const maskPhone = (phone: string) => {
    return phone.slice(0, 4) + '***' + phone.slice(-2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleTriggerCall = async () => {
    setCalling(true);
    setCallResult(null);
    try {
      const result = await mothersAPI.triggerCall(mother.id, 'demo_flag_alert');
      if (result.success) {
        setCallResult(`✓ ${result.message} (${result.provider})`);
        onCallTriggered?.();
      } else {
        setCallResult(`✗ Error: ${result.error}`);
      }
    } catch (error) {
      setCallResult(`✗ Failed to trigger call`);
    } finally {
      setCalling(false);
      setTimeout(() => setCallResult(null), 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="bg-teal-100 p-2 rounded-full">
          <User className="w-5 h-5 text-teal-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-800">{mother.name}</h3>
              <p className="text-sm text-gray-600">Age: {mother.age}</p>
            </div>
            {mother.flagged && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                FLAGGED
              </span>
            )}
          </div>

          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Week {mother.gestation_weeks} | Last ANC: {formatDate(mother.last_anc_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{maskPhone(mother.phone)}</span>
            </div>
          </div>

          {callResult && (
            <div className={`text-xs font-medium mb-2 p-2 rounded ${
              callResult.startsWith('✓') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {callResult}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onView(mother.id)}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition"
            >
              View
            </button>
            <button
              onClick={() => onMarkVisited(mother.id)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition"
            >
              Mark Visited
            </button>
            {mother.flagged && (
              <button
                onClick={handleTriggerCall}
                disabled={calling}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
              >
                <PhoneCall className="w-4 h-4" />
                {calling ? 'Calling...' : 'Call'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

