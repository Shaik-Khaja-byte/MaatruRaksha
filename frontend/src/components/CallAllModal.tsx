import { useState, useEffect } from 'react';
import { X, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Mother } from '../lib/api';

interface CallStatus {
  motherId: string;
  status: 'pending' | 'calling' | 'answered' | 'not_answered' | 'pressed_2';
}

interface CallAllModalProps {
  mothers: Mother[];
  onComplete: (results: Map<string, 'answered' | 'not_answered' | 'pressed_2'>) => void;
  onClose: () => void;
}

export function CallAllModal({ mothers, onComplete, onClose }: CallAllModalProps) {
  const [callStatuses, setCallStatuses] = useState<CallStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setCallStatuses(
      mothers.map(m => ({
        motherId: m.id,
        status: 'pending' as const,
      }))
    );
  }, [mothers]);

  useEffect(() => {
    if (currentIndex >= mothers.length) {
      setIsComplete(true);
      const results = new Map<string, 'answered' | 'not_answered' | 'pressed_2'>();

      callStatuses.forEach(status => {
        if (status.status !== 'pending' && status.status !== 'calling') {
          results.set(status.motherId, status.status);
        }
      });

      setTimeout(() => {
        onComplete(results);
      }, 1000);
      return;
    }

    setCallStatuses(prev =>
      prev.map((s, i) =>
        i === currentIndex ? { ...s, status: 'calling' } : s
      )
    );

    const timer = setTimeout(() => {
      const random = Math.random();
      let result: 'answered' | 'not_answered' | 'pressed_2';

      if (random < 0.7) {
        result = 'answered';
      } else if (random < 0.9) {
        result = 'not_answered';
      } else {
        result = 'pressed_2';
      }

      setCallStatuses(prev =>
        prev.map((s, i) =>
          i === currentIndex ? { ...s, status: result } : s
        )
      );

      setCurrentIndex(currentIndex + 1);
    }, 500 + Math.random() * 500);

    return () => clearTimeout(timer);
  }, [currentIndex, mothers.length]);

  const getStatusIcon = (status: CallStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
      case 'calling':
        return <Phone className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'answered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'not_answered':
        return <XCircle className="w-5 h-5 text-orange-600" />;
      case 'pressed_2':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (status: CallStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'calling':
        return 'Calling...';
      case 'answered':
        return 'Answered';
      case 'not_answered':
        return 'No Answer';
      case 'pressed_2':
        return 'Not Taken';
    }
  };

  const summary = {
    answered: callStatuses.filter(s => s.status === 'answered').length,
    notAnswered: callStatuses.filter(s => s.status === 'not_answered').length,
    pressed2: callStatuses.filter(s => s.status === 'pressed_2').length,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Calling All Mothers</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isComplete ? 'Call simulation complete' : `Processing ${currentIndex + 1} of ${mothers.length}`}
            </p>
          </div>
          {isComplete && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {isComplete && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{summary.answered}</p>
                <p className="text-sm text-green-600">Answered</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-700">{summary.notAnswered}</p>
                <p className="text-sm text-orange-600">No Answer</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">{summary.pressed2}</p>
                <p className="text-sm text-red-600">Not Taken</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {callStatuses.map((status, index) => {
              const mother = mothers[index];
              return (
                <div
                  key={status.motherId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    status.status === 'calling' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  {getStatusIcon(status.status)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{mother.name}</p>
                    <p className="text-xs text-gray-600">{mother.phone}</p>
                  </div>
                  <span className="text-sm text-gray-600">{getStatusText(status.status)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
