import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { CircadianSurvey } from './components/CircadianSurvey';
import { CycleDataForm } from './components/CycleDataForm';
import { Dashboard } from './components/Dashboard';

type AppState = 'auth' | 'survey' | 'cycle' | 'dashboard' | 'loading';

function App() {
  const [state, setState] = useState<AppState>('loading');

  useEffect(() => {
    checkUserState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        (async () => {
          if (session) {
            await checkUserState();
          } else {
            setState('auth');
          }
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setState('auth');
        return;
      }

      const { data: circadianProfile } = await supabase
        .from('circadian_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!circadianProfile) {
        setState('survey');
        return;
      }

      const { data: cycleData } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cycleData) {
        setState('cycle');
        return;
      }

      setState('dashboard');
    } catch (error) {
      console.error('Error checking user state:', error);
      setState('auth');
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (state === 'auth') {
    return <Auth onAuth={() => checkUserState()} />;
  }

  if (state === 'survey') {
    return <CircadianSurvey onComplete={() => setState('cycle')} />;
  }

  if (state === 'cycle') {
    return <CycleDataForm onComplete={() => setState('dashboard')} />;
  }

  return <Dashboard />;
}

export default App;