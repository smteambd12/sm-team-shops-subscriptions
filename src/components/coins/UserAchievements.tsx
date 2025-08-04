
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Calendar } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';

const UserAchievements = () => {
  const { achievements, loading } = useAchievements();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          আপনার অর্জনসমূহ
        </h2>
        <p className="text-gray-600">বিভিন্ন কার্যক্রমের মাধ্যমে অর্জিত সাফল্য</p>
      </div>

      {achievements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">কোনো অর্জন নেই</h3>
            <p className="text-gray-500">বিভিন্ন কার্যক্রমে অংশ নিয়ে অর্জন আনলক করুন!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="relative overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <span className="text-2xl">{achievement.achievement_icon || '🏆'}</span>
                    {achievement.achievement_name}
                  </CardTitle>
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    {achievement.points_earned}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {achievement.achievement_description && (
                  <p className="text-sm text-gray-700">{achievement.achievement_description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-yellow-200">
                  <Calendar className="h-3 w-3" />
                  <span>অর্জনের তারিখ: {formatDate(achievement.unlocked_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {achievements.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">মোট অর্জন</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-800">{achievements.length}</div>
                <div className="text-sm text-purple-600">
                  মোট পয়েন্ট: {achievements.reduce((total, achievement) => total + achievement.points_earned, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserAchievements;
