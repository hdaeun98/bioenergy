import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PeriodUpdateModalProps {
  currentCycle: {
    id: string;
    last_period_start: string;
    next_period_expected: string;
    cycle_length: number;
  } | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function PeriodUpdateModal({ currentCycle, onClose, onUpdate }: PeriodUpdateModalProps) {
  const [lastPeriodStart, setLastPeriodStart] = useState(
    currentCycle?.last_period_start || ''
  );
  const [nextPeriodExpected, setNextPeriodExpected] = useState(
    currentCycle?.next_period_expected || ''
  );
  const [cycleLength, setCycleLength] = useState(
    currentCycle?.cycle_length.toString() || '28'
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to continue');
        return;
      }

      if (currentCycle) {
        const { error } = await supabase
          .from('menstrual_cycles')
          .update({
            last_period_start: lastPeriodStart,
            next_period_expected: nextPeriodExpected,
            cycle_length: parseInt(cycleLength),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentCycle.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('menstrual_cycles').insert({
          user_id: user.id,
          last_period_start: lastPeriodStart,
          next_period_expected: nextPeriodExpected,
          cycle_length: parseInt(cycleLength),
        });

        if (error) throw error;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating cycle data:', error);
      alert('Failed to update cycle data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Update Period Info</h2>
        <p className="text-gray-600 mb-6">Keep your cycle data up to date for accurate predictions</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Period Start Date
            </label>
            <input
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Period Expected Date
            </label>
            <input
              type="date"
              value={nextPeriodExpected}
              onChange={(e) => setNextPeriodExpected(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Cycle Length (days)
            </label>
            <input
              type="number"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              min="21"
              max="35"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Typical range: 21-35 days</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
