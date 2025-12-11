import { Phone, Clock } from 'lucide-react';
import { CallLog, Mother } from '../lib/api';

interface CallLogsListProps {
  callLogs: CallLog[];
  mothers: Mother[];
}

export function CallLogsList({ callLogs, mothers }: CallLogsListProps) {
  const getMotherName = (motherId: string) => {
    const mother = mothers.find(m => m.id === motherId);
    return mother?.name || 'Unknown';
  };

  const maskPhone = (phone: string) => {
    return phone.slice(0, 4) + '***' + phone.slice(-2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResultDisplay = (result: string) => {
    switch (result) {
      case 'answered':
        return { text: 'Answered', color: 'text-green-700 bg-green-100' };
      case 'not_answered':
        return { text: 'No Answer', color: 'text-orange-700 bg-orange-100' };
      case 'pressed_2':
        return { text: 'Not Taken', color: 'text-red-700 bg-red-100' };
      default:
        return { text: result, color: 'text-gray-700 bg-gray-100' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Phone className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Calls ({callLogs.length})
        </h2>
      </div>

      {callLogs.length === 0 ? (
        <p className="text-sm text-gray-500">No call logs yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {callLogs.slice(0, 10).map(log => {
            const resultDisplay = getResultDisplay(log.result);
            return (
              <div
                key={log.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {getMotherName(log.mother_id)}
                  </p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${resultDisplay.color}`}>
                    {resultDisplay.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>{maskPhone(log.phone)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(log.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
