import * as LucideIcons from 'lucide-react';
import { Activity } from '../lib/activityRecommendations';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const IconComponent = (LucideIcons as any)[
    activity.icon.split('-').map((word, i) =>
      i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) :
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')
  ] || LucideIcons.Activity;

  const getCategoryColor = (category: string) => {
    const colors = {
      focus: 'bg-blue-100 text-blue-700',
      creative: 'bg-purple-100 text-purple-700',
      social: 'bg-green-100 text-green-700',
      rest: 'bg-gray-100 text-gray-700',
      exercise: 'bg-orange-100 text-orange-700',
      routine: 'bg-yellow-100 text-yellow-700',
    };
    return colors[category as keyof typeof colors] || colors.routine;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getCategoryColor(activity.category)}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{activity.name}</h4>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
      </div>
    </div>
  );
}
