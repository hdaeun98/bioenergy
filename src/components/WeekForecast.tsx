import { CircadianProfile, MenstrualCycle } from '../lib/supabase';
import { generate7DayPredictions } from '../lib/energyCalculator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">7-Day Energy Forecast</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {predictions.map((prediction, index) => {
          const isToday = index === 0;
          const previousEnergy = index > 0 ? predictions[index - 1].baselineEnergy : undefined;

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                isToday ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-center mb-3">
                <p className={`font-semibold ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                  {isToday ? 'Today' : getDayName(prediction.date)}
                </p>
                <p className="text-sm text-gray-600">{formatDate(prediction.date)}</p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-3xl font-bold text-gray-800">
                  {prediction.baselineEnergy}%
                </span>
                {getEnergyTrend(prediction.baselineEnergy, previousEnergy)}
              </div>

              {menstrualCycle && prediction.cyclePhase !== 'neutral' && (
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(prediction.cyclePhase)}`}>
                    {getPhaseLabel(prediction.cyclePhase)}
                  </span>
                </div>
              )}

              <div className="mt-4">
                <div className="h-16 flex items-end justify-between gap-0.5">
                  {[0, 6, 12, 18].map((hour) => {
                    const level = prediction.hourlyLevels[hour];
                    const height = (level.energy / 100) * 100;
                    const color =
                      level.energy >= 80
                        ? 'bg-green-500'
                        : level.energy >= 60
                        ? 'bg-blue-500'
                        : level.energy >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500';

                    return (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full ${color} rounded-t transition-all`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>6</span>
                  <span>12</span>
                  <span>18</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
