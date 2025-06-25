
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  Star, 
  BookOpen,
  Trophy,
  Clock
} from 'lucide-react';
import { PersonalizedAIService, StudyPlan, LearningProgress } from '@/services/personalizedAIService';
import { useUserWordLibrary } from '@/hooks/useUserWordLibrary';

export function PersonalizedDashboard() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats } = useUserWordLibrary();

  useEffect(() => {
    loadPersonalizedData();
  }, []);

  const loadPersonalizedData = async () => {
    setLoading(true);
    try {
      const [planData, progressData] = await Promise.all([
        PersonalizedAIService.generateDailyStudyPlan(),
        PersonalizedAIService.analyzeLearningProgress()
      ]);
      
      setStudyPlan(planData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading personalized data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Words in Library</p>
                <p className="text-2xl font-bold">{stats?.words_in_library || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Words Mastered</p>
                <p className="text-2xl font-bold">{stats?.words_mastered || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mastery Trend</p>
                <p className="text-2xl font-bold">{Math.round((progress?.mastery_trend || 0) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Study Sessions</p>
                <p className="text-2xl font-bold">{stats?.study_sessions_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Study Plan */}
      {studyPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Daily Study Plan
              <Badge variant="secondary">{studyPlan.estimated_time} min</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {studyPlan.daily_words.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  New Words to Learn ({studyPlan.daily_words.length})
                </h4>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {studyPlan.daily_words.slice(0, 6).map((word) => (
                    <Card key={word.id} className="p-3">
                      <div className="font-medium capitalize">{word.word}</div>
                      <div className="text-sm text-muted-foreground">{word.partOfSpeech}</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {studyPlan.review_words.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Words to Review ({studyPlan.review_words.length})
                </h4>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {studyPlan.review_words.map((word) => (
                    <Card key={word.id} className="p-3">
                      <div className="font-medium capitalize">{word.word}</div>
                      <div className="text-sm text-muted-foreground">Review needed</div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <h4 className="font-medium">Focus Areas:</h4>
              {studyPlan.focus_areas.map((area) => (
                <Badge key={area} variant="outline">
                  {area.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Progress */}
      {progress && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Study Consistency</span>
                  <span className="text-sm">{Math.round(progress.study_consistency * 100)}%</span>
                </div>
                <Progress value={progress.study_consistency * 100} />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Overall Mastery</span>
                  <span className="text-sm">{Math.round(progress.mastery_trend * 100)}%</span>
                </div>
                <Progress value={progress.mastery_trend * 100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Achievements & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.strength_areas.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-1">
                    {progress.strength_areas.map((area) => (
                      <Badge key={area} variant="default" className="text-xs">
                        {area.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {progress.next_milestones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Next Milestones</h4>
                  <ul className="space-y-1">
                    {progress.next_milestones.map((milestone, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={loadPersonalizedData} variant="outline">
          Refresh Recommendations
        </Button>
      </div>
    </div>
  );
}

export default PersonalizedDashboard;
