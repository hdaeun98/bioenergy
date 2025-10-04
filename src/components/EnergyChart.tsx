import { EnergyLevel } from '../lib/energyCalculator';

interface EnergyChartProps {
  energyLevels: EnergyLevel[];
  currentHour: number;
}

export function EnergyChart({ energyLevels, currentHour }: EnergyChartProps) {
  const maxEnergy = 100;
  const chartHeight = 200;

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return '#10b981';
    if (energy >= 60) return '#3b82f6';
    if (energy >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative">
      <svg width="100%" height={chartHeight} className="overflow-visible">
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <line
          x1="0"
          y1={chartHeight - 50}
          x2="100%"
          y2={chartHeight - 50}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4"
        />
        <line
          x1="0"
          y1={chartHeight - 100}
          x2="100%"
          y2={chartHeight - 100}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4"
        />
        <line
          x1="0"
          y1={chartHeight - 150}
          x2="100%"
          y2={chartHeight - 150}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="4"
        />

        {energyLevels.map((level, index) => {
          const x = (index / 23) * 100;
          const nextLevel = energyLevels[index + 1];

          if (!nextLevel) return null;

          const y = chartHeight - 20 - (level.energy / maxEnergy) * (chartHeight - 40);
          const nextX = ((index + 1) / 23) * 100;
          const nextY = chartHeight - 20 - (nextLevel.energy / maxEnergy) * (chartHeight - 40);

          return (
            <g key={index}>
              <line
                x1={`${x}%`}
                y1={y}
                x2={`${nextX}%`}
                y2={nextY}
                stroke={getEnergyColor(level.energy)}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {energyLevels.map((level, index) => {
          const x = (index / 23) * 100;
          const y = chartHeight - 20 - (level.energy / maxEnergy) * (chartHeight - 40);
          const isCurrentHour = index === currentHour;

          return (
            <g key={`point-${index}`}>
              <circle
                cx={`${x}%`}
                cy={y}
                r={isCurrentHour ? 6 : 3}
                fill={isCurrentHour ? '#ef4444' : getEnergyColor(level.energy)}
                stroke={isCurrentHour ? '#fff' : 'none'}
                strokeWidth={isCurrentHour ? 2 : 0}
              />
              {index % 3 === 0 && (
                <text
                  x={`${x}%`}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {level.hour}:00
                </text>
              )}
            </g>
          );
        })}

        <line
          x1={`${(currentHour / 23) * 100}%`}
          y1="0"
          x2={`${(currentHour / 23) * 100}%`}
          y2={chartHeight - 20}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4"
          opacity="0.5"
        />
      </svg>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>0% Low Energy</span>
        <span>50% Moderate</span>
        <span>100% Peak Energy</span>
      </div>
    </div>
  );
}
