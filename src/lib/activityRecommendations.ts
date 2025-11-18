import { EnergyLevel } from './energyCalculator';

export interface Activity {
  name: string;
  description: string;
  category: 'focus' | 'creative' | 'social' | 'rest' | 'exercise' | 'routine';
  icon: string;
}

export interface TimeSlot {
  hour: number;
  energyLevel: number;
  activities: Activity[];
  rationale: string;
}

function getActivitiesForEnergyLevel(
  hour: number,
  energyLevel: number,
  cyclePhase: string
): Activity[] {
  const activities: Activity[] = [];

  if (energyLevel >= 80) {
    activities.push(
      {
        name: 'Deep Work',
        description: 'Tackle your most challenging tasks requiring intense focus',
        category: 'focus',
        icon: 'brain',
      },
      {
        name: 'Strategic Planning',
        description: 'Make important decisions and plan long-term goals',
        category: 'focus',
        icon: 'target',
      },
      {
        name: 'Learning New Skills',
        description: 'Your brain is primed for absorbing new information',
        category: 'focus',
        icon: 'book-open',
      }
    );

    if (cyclePhase === 'ovulatory' || cyclePhase === 'follicular') {
      activities.push({
        name: 'Social Networking',
        description: 'Connect with others, attend meetings, or collaborate',
        category: 'social',
        icon: 'users',
      });
    }
  } else if (energyLevel >= 60) {
    activities.push(
      {
        name: 'Creative Work',
        description: 'Brainstorm, write, design, or work on creative projects',
        category: 'creative',
        icon: 'lightbulb',
      },
      {
        name: 'Moderate Exercise',
        description: 'Go for a run, hit the gym, or take a fitness class',
        category: 'exercise',
        icon: 'activity',
      },
      {
        name: 'Team Collaboration',
        description: 'Participate in meetings and collaborative work',
        category: 'social',
        icon: 'users',
      },
      {
        name: 'Problem Solving',
        description: 'Work through challenges that require logical thinking',
        category: 'focus',
        icon: 'puzzle',
      }
    );
  } else if (energyLevel >= 40) {
    activities.push(
      {
        name: 'Routine Tasks',
        description: 'Handle emails, organize, and complete admin work',
        category: 'routine',
        icon: 'check-square',
      },
      {
        name: 'Light Exercise',
        description: 'Gentle yoga, walking, or stretching',
        category: 'exercise',
        icon: 'move',
      },
      {
        name: 'Reading',
        description: 'Catch up on articles, reports, or light reading',
        category: 'creative',
        icon: 'book',
      }
    );

    if (cyclePhase === 'menstrual') {
      activities.push({
        name: 'Self-Care',
        description: 'Focus on activities that nurture and restore you',
        category: 'rest',
        icon: 'heart',
      });
    }
  } else {
    activities.push(
      {
        name: 'Rest & Recovery',
        description: 'Take breaks, meditate, or practice mindfulness',
        category: 'rest',
        icon: 'moon',
      },
      {
        name: 'Light Activities',
        description: 'Gentle tasks that don\'t require much mental energy',
        category: 'routine',
        icon: 'coffee',
      },
      {
        name: 'Reflection',
        description: 'Journal, reflect, or plan for tomorrow',
        category: 'rest',
        icon: 'pen-tool',
      }
    );
  }

  if (hour >= 5 && hour <= 7) {
    activities.unshift({
      name: 'Morning Routine',
      description: 'Hydrate, eat a nutritious breakfast, and set intentions',
      category: 'routine',
      icon: 'sunrise',
    });
  }

  if (hour >= 22 || hour <= 4) {
    activities.unshift({
      name: 'Sleep Preparation',
      description: 'Wind down, dim lights, and prepare for quality sleep',
      category: 'rest',
      icon: 'moon',
    });
  }

  return activities.slice(0, 4);
}

function getRationale(hour: number, energyLevel: number, cyclePhase: string): string {
  const timeOfDay =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  if (energyLevel >= 80) {
    return `Your peak performance window in the ${timeOfDay}. Cortisol and cognitive function are optimized for complex tasks.`;
  } else if (energyLevel >= 60) {
    return `Good energy levels in the ${timeOfDay}. Your brain is alert and ready for productive work.`;
  } else if (energyLevel >= 40) {
    return `Moderate energy in the ${timeOfDay}. Best for lighter tasks and maintaining momentum.`;
  } else {
    return `Lower energy in the ${timeOfDay}. Your body and mind benefit from rest and recovery activities.`;
  }
}

export function generateTimeSlotRecommendations(energyLevels: EnergyLevel[]): TimeSlot[] {
  return energyLevels.map((level) => ({
    hour: level.hour,
    energyLevel: level.energy,
    activities: getActivitiesForEnergyLevel(level.hour, level.energy, level.phase),
    rationale: getRationale(level.hour, level.energy, level.phase),
  }));
}

export function getPhaseAdvice(cyclePhase: string): string {
  const advice = {
    menstrual:
      'Your body is shedding the uterine lining. Energy may be lower, so prioritize rest, gentle movement, and iron-rich foods. Listen to your body and don\'t push too hard.',
    follicular:
      'Rising estrogen boosts energy, mood, and cognitive function. This is an excellent time for challenging projects, learning new skills, and social activities.',
    ovulatory:
      'Peak estrogen and testosterone levels enhance communication, confidence, and energy. Ideal for important presentations, negotiations, and social engagements.',
    luteal:
      'Progesterone rises, potentially affecting energy and mood. Focus on completing projects, detail-oriented work, and self-care. Increase magnesium and B-vitamin intake.',
    neutral:
      'Maintain balanced energy throughout the day by staying hydrated, eating regular meals, and following your natural circadian rhythm.',
  };

  return advice[cyclePhase as keyof typeof advice] || advice.neutral;
}
