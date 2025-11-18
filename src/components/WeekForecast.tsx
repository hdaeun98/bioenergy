import { CircadianProfile, MenstrualCycle } from '../lib/supabase';
import { generate7DayPredictions } from '../lib/energyCalculator';
import { getDailyRecommendations } from '../lib/dailyRecommendations';
import { TrendingUp, TrendingDown, Minus, Utensils, Activity } from 'lucide-react';

interface WeekForecastProps {
  circadianProfile: CircadianProfile;
  menstrualCycle: MenstrualCycle | null;
}

export function WeekForecast({ circadianProfile, menstrualCycle }: WeekForecastProps) {
  const predictions = generate7DayPredictions(circadianProfile, menstrualCycle);

  const getPhaseLabel = (phase: string) => {
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      menstrual: 'bg-red-100 text-red-700',
      follicular: 'bg-green-100 text-green-700',
      ovulatory: 'bg-yellow-100 text-yellow-700',
      luteal: 'bg-blue-100 text-blue-700',
      neutral: 'bg-gray-100 text-gray-700',
    };
    return colors[phase as keyof typeof colors] || colors.neutral;
  };

  const getEnergyTrend = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (diff < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getDayName = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">7-Day Energy Forecast</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {predictions.map((prediction, index) => {
          const isToday = index === 0;
          const previousEnergy = index > 0 ? predictions[index - 1].baselineEnergy : undefined;
          const recommendations = getDailyRecommendations(
            prediction.baselineEnergy,
            prediction.cyclePhase
          );

          return (
            <div
              key={index}
              className={`border rounded-lg p-5 ${
                isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className={`font-semibold text-lg ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                    {isToday ? 'Today' : getDayName(prediction.date)}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(prediction.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {prediction.baselineEnergy}%
                  </span>
                  {getEnergyTrend(prediction.baselineEnergy, previousEnergy)}
                </div>
              </div>

              {menstrualCycle && prediction.cyclePhase !== 'neutral' && (
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(prediction.cyclePhase)}`}>
                    {getPhaseLabel(prediction.cyclePhase)}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-end justify-between gap-2 h-20">
                    {[0, 6, 12, 18].map((hour) => {
                      const level = prediction.hourlyLevels[hour];
                      const heightPercent = (level.energy / 100) * 80;
                      const color =
                        level.energy >= 80
                          ? 'bg-green-500'
                          : level.energy >= 60
                          ? 'bg-blue-500'
                          : level.energy >= 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500';

                      return (
                        <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full ${color} rounded-t-md shadow-sm border border-opacity-20 border-current transition-all hover:shadow-md`}
                            style={{ height: `${heightPercent}px`, minHeight: '4px' }}
                          />
                          <span className="text-xs text-gray-500">{hour}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Energy Level Throughout the Day
                </div>
              </div>

              <div className="space-y-3 border-t pt-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-semibold text-gray-700">Recommended Foods</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendations.foods.slice(0, 3).map((food, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-700">Recommended Activities</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recommendations.activities.slice(0, 3).map((activity, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Energy Level Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">80-100% Peak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">60-79% High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">40-59% Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">0-39% Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
