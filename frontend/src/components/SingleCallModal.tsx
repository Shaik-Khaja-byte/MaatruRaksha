import { useState } from 'react';
import { X, Phone } from 'lucide-react';

interface SingleCallModalProps {
  motherName: string;
  motherPhone: string;
  onComplete: (result: 'answered' | 'pressed_2') => void;
  onClose: () => void;
}

export function SingleCallModal({ motherName, motherPhone, onComplete, onClose }: SingleCallModalProps) {
  const [callStarted, setCallStarted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const startCall = () => {
    setCallStarted(true);
    setTimeout(() => {
      setShowPrompt(true);
    }, 2000);
  };

  const handleResponse = (pressed: '1' | '2') => {
    if (pressed === '1') {
      onComplete('answered');
    } else {
      onComplete('pressed_2');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Call Mother</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!callStarted ? (
            <div className="text-center">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{motherName}</h3>
              <p className="text-gray-600 mb-6">{motherPhone}</p>
              <button
                onClick={startCall}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Start Call
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Calling...</h3>
              <p className="text-gray-600 mb-6">{motherName}</p>

              {showPrompt && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 mb-4">
                    "Hello, this is your ASHA worker calling about your antenatal care.
                    Have you taken your iron tablets today? Press 1 for Yes, Press 2 for No."
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleResponse('1')}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                    >
                      Press 1 (Yes)
                    </button>
                    <button
                      onClick={() => handleResponse('2')}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
                    >
                      Press 2 (No)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
