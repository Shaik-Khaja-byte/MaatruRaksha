import { AlertCircle } from 'lucide-react';
import { Mother } from '../lib/api';

interface FlaggedMothersListProps {
  mothers: Mother[];
  onView: (id: string) => void;
}

export function FlaggedMothersList({ mothers, onView }: FlaggedMothersListProps) {
  const flaggedMothers = mothers.filter(m => m.flagged);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 p-2 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Flagged Mothers ({flaggedMothers.length})
        </h2>
      </div>

      {flaggedMothers.length === 0 ? (
        <p className="text-sm text-gray-500">No flagged mothers</p>
      ) : (
        <div className="space-y-2">
          {flaggedMothers.map(mother => (
            <div
              key={mother.id}
              onClick={() => onView(mother.id)}
              className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition"
            >
              <p className="font-medium text-gray-800">{mother.name}</p>
              <p className="text-xs text-gray-600">Week {mother.gestation_weeks}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
