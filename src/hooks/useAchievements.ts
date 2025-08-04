
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description?: string;
  achievement_icon?: string;
  points_earned: number;
  unlocked_at: string;
  created_at: string;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  return {
    achievements,
    loading,
    fetchAchievements
  };
};
