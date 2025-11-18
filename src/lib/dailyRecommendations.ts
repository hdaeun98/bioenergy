interface DailyRecommendation {
  foods: string[];
  activities: string[];
}

export function getDailyRecommendations(
  energyLevel: number,
  cyclePhase: string
): DailyRecommendation {
  const recommendations: DailyRecommendation = {
    foods: [],
    activities: [],
  };

  if (energyLevel >= 80) {
    recommendations.activities = ['HIIT workout', 'Team sports', 'Complex projects'];
  } else if (energyLevel >= 60) {
    recommendations.activities = ['Cardio', 'Social meetings', 'Creative work'];
  } else if (energyLevel >= 40) {
    recommendations.activities = ['Walking', 'Light yoga', 'Administrative tasks'];
  } else {
    recommendations.activities = ['Meditation', 'Rest', 'Light reading'];
  }

  switch (cyclePhase) {
    case 'menstrual':
      recommendations.foods = ['Iron-rich foods', 'Leafy greens', 'Dark chocolate'];
      recommendations.activities = [
        ...recommendations.activities.filter(a => !a.includes('HIIT')),
        'Gentle stretching',
        'Restorative yoga',
      ];
      break;
    case 'follicular':
      recommendations.foods = ['Whole grains', 'Lean proteins', 'Fresh fruits'];
      recommendations.activities = [
        'Strength training',
        'New challenges',
        'Social activities',
      ];
      break;
    case 'ovulatory':
      recommendations.foods = ['Colorful vegetables', 'Omega-3 rich fish', 'Berries'];
      recommendations.activities = [
        'High-intensity workouts',
        'Important meetings',
        'Public speaking',
      ];
      break;
    case 'luteal':
      recommendations.foods = ['Complex carbs', 'Magnesium-rich foods', 'Herbal tea'];
      recommendations.activities = [
        'Moderate exercise',
        'Detail-oriented work',
        'Planning sessions',
      ];
      break;
    default:
      recommendations.foods = ['Balanced meals', 'Hydration', 'Nutrient-dense foods'];
      break;
  }

  if (cyclePhase === 'neutral') {
    if (energyLevel >= 80) {
      recommendations.foods = ['Lean proteins', 'Complex carbs', 'Healthy fats'];
    } else if (energyLevel >= 60) {
      recommendations.foods = ['Whole grains', 'Vegetables', 'Nuts'];
    } else if (energyLevel >= 40) {
      recommendations.foods = ['Light meals', 'Fruits', 'Green tea'];
    } else {
      recommendations.foods = ['Warm soups', 'Herbal tea', 'Easy-to-digest foods'];
    }
  }

  return recommendations;
}
