import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SurveyData {
  gender: string;
  naturalWakeTime: string;
  bedTime: string;
  energyPeakTime: string;
  preferredWorkTime: string;
  weekendWakeTime: string;
  alertnessLevel: string;
}

interface CircadianSurveyProps {
  onComplete: () => void;
}

export function CircadianSurvey({ onComplete }: CircadianSurveyProps) {
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    gender: '',
    naturalWakeTime: '',
    bedTime: '',
    energyPeakTime: '',
    preferredWorkTime: '',
    weekendWakeTime: '',
    alertnessLevel: '',
  });
  const [loading, setLoading] = useState(false);

  const updateSurveyData = (field: keyof SurveyData, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeChronotype = (): 'morning' | 'intermediate' | 'evening' => {
    const wakeHour = parseInt(surveyData.naturalWakeTime.split(':')[0]);
    const peakHour = parseInt(surveyData.energyPeakTime.split(':')[0]);

    if (wakeHour <= 6 && peakHour <= 12) return 'morning';
    if (wakeHour >= 9 && peakHour >= 16) return 'evening';
    return 'intermediate';
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in to continue');
        return;
      }

      const chronotype = analyzeChronotype();

      const { data: existingProfile } = await supabase
        .from('circadian_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('circadian_profiles')
          .update({
            chronotype,
            gender: surveyData.gender,
            natural_wake_time: surveyData.naturalWakeTime,
            peak_energy_time: surveyData.energyPeakTime,
            survey_responses: surveyData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('circadian_profiles')
          .insert({
            user_id: user.id,
            chronotype,
            gender: surveyData.gender,
            natural_wake_time: surveyData.naturalWakeTime,
            peak_energy_time: surveyData.energyPeakTime,
            survey_responses: surveyData,
          });

        if (error) throw error;
      }

      onComplete();
    } catch (error) {
      console.error('Error saving survey:', error);
      alert('Failed to save survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">What is your gender?</h2>
            <p className="text-gray-600">This helps personalize your energy recommendations.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={surveyData.gender === 'female'}
                  onChange={(e) => updateSurveyData('gender', e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg text-gray-700">Female</span>
              </label>
              <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={surveyData.gender === 'male'}
                  onChange={(e) => updateSurveyData('gender', e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg text-gray-700">Male</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">When do you naturally wake up?</h2>
            <p className="text-gray-600">Think about weekends or days without an alarm.</p>
            <input
              type="time"
              value={surveyData.naturalWakeTime}
              onChange={(e) => updateSurveyData('naturalWakeTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">When do you typically feel most alert and energetic?</h2>
            <p className="text-gray-600">Select the time when you feel your mental clarity peaks.</p>
            <select
              value={surveyData.energyPeakTime}
              onChange={(e) => updateSurveyData('energyPeakTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select a time...</option>
              <option value="06:00">6:00 AM - Early morning</option>
              <option value="09:00">9:00 AM - Mid morning</option>
              <option value="12:00">12:00 PM - Midday</option>
              <option value="15:00">3:00 PM - Afternoon</option>
              <option value="18:00">6:00 PM - Evening</option>
              <option value="21:00">9:00 PM - Late evening</option>
            </select>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">When do you prefer to do mentally demanding work?</h2>
            <p className="text-gray-600">When is your brain at its best for focus and problem-solving?</p>
            <select
              value={surveyData.preferredWorkTime}
              onChange={(e) => updateSurveyData('preferredWorkTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select a time...</option>
              <option value="early-morning">Early morning (5-8 AM)</option>
              <option value="morning">Morning (8-11 AM)</option>
              <option value="midday">Midday (11 AM-2 PM)</option>
              <option value="afternoon">Afternoon (2-5 PM)</option>
              <option value="evening">Evening (5-8 PM)</option>
              <option value="night">Night (8 PM-midnight)</option>
            </select>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">What time do you usually go to bed?</h2>
            <p className="text-gray-600">Your typical bedtime on a regular night.</p>
            <input
              type="time"
              value={surveyData.bedTime}
              onChange={(e) => updateSurveyData('bedTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">How would you describe your morning alertness?</h2>
            <p className="text-gray-600">In the first hour after waking up.</p>
            <select
              value={surveyData.alertnessLevel}
              onChange={(e) => updateSurveyData('alertnessLevel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Select an option...</option>
              <option value="very-alert">Very alert and ready to go</option>
              <option value="somewhat-alert">Somewhat alert after some time</option>
              <option value="groggy">Groggy and need time to wake up</option>
              <option value="very-groggy">Very groggy, takes hours to feel alert</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return surveyData.gender !== '';
      case 2:
        return surveyData.naturalWakeTime !== '';
      case 3:
        return surveyData.energyPeakTime !== '';
      case 4:
        return surveyData.preferredWorkTime !== '';
      case 5:
        return surveyData.bedTime !== '';
      case 6:
        return surveyData.alertnessLevel !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Question {step} of 6</span>
            <span className="text-sm font-medium text-blue-600">{(step / 6 * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step < 6 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
