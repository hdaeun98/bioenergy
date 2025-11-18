import { CircadianProfile, MenstrualCycle } from './supabase';

export interface EnergyLevel {
  hour: number;
  energy: number;
  phase: string;
}

export interface DayPrediction {
  date: Date;
  cyclePhase: string;
  baselineEnergy: number;
  hourlyLevels: EnergyLevel[];
}

function getCyclePhase(dayInCycle: number, cycleLength: number): string {
  const phaseDay = ((dayInCycle % cycleLength) + cycleLength) % cycleLength;

  if (phaseDay >= 0 && phaseDay < 5) return 'menstrual';
  if (phaseDay >= 5 && phaseDay < 12) return 'follicular';
  if (phaseDay >= 12 && phaseDay < 17) return 'ovulatory';
  return 'luteal';
}

function getCycleEnergyModifier(phase: string): number {
  const modifiers = {
    menstrual: 0.7,
    follicular: 1.0,
    ovulatory: 1.1,
    luteal: 0.85,
  };
  return modifiers[phase as keyof typeof modifiers] || 1.0;
}

function getCircadianCurve(hour: number, chronotype: string): number {
  const curves = {
    morning: [
      0.3, 0.3, 0.3, 0.4, 0.5, 0.7, 0.9, 1.0, 0.95, 0.9, 0.85, 0.8,
      0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.3, 0.3,
    ],
    intermediate: [
      0.3, 0.3, 0.3, 0.3, 0.4, 0.5, 0.7, 0.85, 0.95, 1.0, 0.95, 0.9,
      0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.4, 0.35, 0.3, 0.3,
    ],
    evening: [
      0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9,
      0.95, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.5, 0.4, 0.35,
    ],
  };

  return curves[chronotype as keyof typeof curves]?.[hour] || 0.5;
}

export function calculateEnergyLevels(
  circadianProfile: CircadianProfile,
  menstrualCycle: MenstrualCycle | null,
  targetDate: Date
): EnergyLevel[] {
  const hourlyLevels: EnergyLevel[] = [];

  let cycleModifier = 1.0;
  let cyclePhase = 'neutral';

  if (menstrualCycle) {
    const lastPeriod = new Date(menstrualCycle.last_period_start);
    const daysSinceLastPeriod = Math.floor(
      (targetDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );

    cyclePhase = getCyclePhase(daysSinceLastPeriod, menstrualCycle.cycle_length);
    cycleModifier = getCycleEnergyModifier(cyclePhase);
  }

  for (let hour = 0; hour < 24; hour++) {
    const circadianEnergy = getCircadianCurve(hour, circadianProfile.chronotype);
    const combinedEnergy = Math.min(100, Math.round(circadianEnergy * cycleModifier * 100));

    hourlyLevels.push({
      hour,
      energy: combinedEnergy,
      phase: cyclePhase,
    });
  }

  return hourlyLevels;
}

export function generate7DayPredictions(
  circadianProfile: CircadianProfile,
  menstrualCycle: MenstrualCycle | null
): DayPrediction[] {
  const predictions: DayPrediction[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const hourlyLevels = calculateEnergyLevels(circadianProfile, menstrualCycle, date);

    let cyclePhase = 'neutral';
    if (menstrualCycle) {
      const lastPeriod = new Date(menstrualCycle.last_period_start);
      const daysSinceLastPeriod = Math.floor(
        (date.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
      );
      cyclePhase = getCyclePhase(daysSinceLastPeriod, menstrualCycle.cycle_length);
    }

    const avgEnergy = Math.round(
      hourlyLevels.reduce((sum, level) => sum + level.energy, 0) / hourlyLevels.length
    );

    predictions.push({
      date,
      cyclePhase,
      baselineEnergy: avgEnergy,
      hourlyLevels,
    });
  }

  return predictions;
}
