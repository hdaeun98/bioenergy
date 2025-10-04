import { useState, useEffect } from 'react';
import { Clock, Activity, Calendar, TrendingUp } from 'lucide-react';
import { CircadianProfile, MenstrualCycle, supabase } from '../lib/supabase';
import { calculateEnergyLevels } from '../lib/energyCalculator';
import { generateTimeSlotRecommendations, getPhaseAdvice } from '../lib/activityRecommendations';
import { EnergyChart } from './EnergyChart';
import { ActivityCard } from './ActivityCard';
import { WeekForecast } from './WeekForecast';

export function Dashboard() {
  const [circadianProfile, setCircadianProfile] = useState<CircadianProfile | null>(null);
  const [menstrualCycle, setMenstrualCycle] = useState<MenstrualCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHour] = useState(new Date().getHours());

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [circadianResult, cycleResult] = await Promise.all([
        supabase
          .from('circadian_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('menstrual_cycles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (circadianResult.data) setCircadianProfile(circadianResult.data);
      if (cycleResult.data) setMenstrualCycle(cycleResult.data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your energy insights...</div>
      </div>
    );
  }

  if (!circadianProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No profile data found</div>
      </div>
    );
  }

  const today = new Date();
  const energyLevels = calculateEnergyLevels(circadianProfile, menstrualCycle, today);
  const timeSlots = generateTimeSlotRecommendations(energyLevels);
  const currentSlot = timeSlots[currentHour];

  const cyclePhase = menstrualCycle
    ? energyLevels[0].phase
    : 'neutral';
  const phaseAdvice = getPhaseAdvice(cyclePhase);

  const getChronotypeLabel = (type: string) => {
    const labels = {
      morning: 'Early Bird',
      intermediate: 'Intermediate',
      evening: 'Night Owl',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPhaseLabel = (phase: string) => {
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Energy Dashboard</h1>
          <p className="text-gray-600">
            Personalized insights based on your circadian rhythm and biological cycles
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Chronotype</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {getChronotypeLabel(circadianProfile.chronotype)}
            </p>
          </div>

          {menstrualCycle && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-800">Cycle Phase</h3>
              </div>
              <p className="text-2xl font-bold text-pink-600">{getPhaseLabel(cyclePhase)}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Current Energy</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {currentSlot.energyLevel}%
            </p>
          </div>
        </div>

        {menstrualCycle && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-pink-700" />
              <h3 className="font-semibold text-gray-800">Cycle Insights</h3>
            </div>
            <p className="text-gray-700">{phaseAdvice}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Energy Levels</h2>
          <EnergyChart energyLevels={energyLevels} currentHour={currentHour} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Recommended Activities (Now - {currentHour}:00)
          </h2>
          <p className="text-gray-600 mb-4">{currentSlot.rationale}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSlot.activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        </div>

        <WeekForecast
          circadianProfile={circadianProfile}
          menstrualCycle={menstrualCycle}
        />
      </div>
    </div>
  );
}
