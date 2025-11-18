import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CycleDataFormProps {
  onComplete: () => void;
}

export function CycleDataForm({ onComplete }: CycleDataFormProps) {
  const [lastPeriodStart, setLastPeriodStart] = useState('');
  const [nextPeriodExpected, setNextPeriodExpected] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
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

      const { error } = await supabase.from('menstrual_cycles').insert({
        user_id: user.id,
        last_period_start: lastPeriodStart,
        next_period_expected: nextPeriodExpected,
        cycle_length: parseInt(cycleLength),
      });

      if (error) throw error;

      onComplete();
    } catch (error) {
      console.error('Error saving cycle data:', error);
      alert('Failed to save cycle data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Cycle Tracking</h2>
        <p className="text-gray-600 mb-8">
          Help us predict your energy levels throughout your cycle
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Period Start Date
            </label>
            <input
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Typical range: 21-35 days</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
