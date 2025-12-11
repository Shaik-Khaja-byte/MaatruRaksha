import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { phcAPI, PHCStock } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function PHCStockPanel() {
  const { asha } = useAuth();
  const [stock, setStock] = useState<PHCStock | null>(null);
  const [ironTablets, setIronTablets] = useState(0);
  const [ttVaccine, setTtVaccine] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStock();
  }, [asha]);

  const loadStock = async () => {
    if (!asha) return;

    try {
      const data = await phcAPI.getStock();
      setStock(data);
      setIronTablets(data.iron_tablets);
      setTtVaccine(data.tt_vaccine);
    } catch (error) {
      console.error('Error loading stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async () => {
    if (!asha || !stock) return;

    try {
      const updated = await phcAPI.updateStock({
        iron_tablets: ironTablets,
        tt_vaccine: ttVaccine,
      });
      setStock(updated);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-100 p-2 rounded-lg">
          <Package className="w-5 h-5 text-teal-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">PHC Stock</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Iron Tablets
          </label>
          <input
            type="number"
            value={ironTablets}
            onChange={(e) => setIronTablets(Number(e.target.value))}
            onBlur={updateStock}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TT Vaccine
          </label>
          <input
            type="number"
            value={ttVaccine}
            onChange={(e) => setTtVaccine(Number(e.target.value))}
            onBlur={updateStock}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
