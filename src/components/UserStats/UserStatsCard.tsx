
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Target, TrendingUp } from 'lucide-react';
import { UserStudyStats } from '@/services/userWordLibraryService';

interface UserStatsCardProps {
  stats: UserStudyStats;
  className?: string;
}

export function UserStatsCard({ stats, className }: UserStatsCardProps) {
  const masteryPercentage = stats.words_in_library > 0 
    ? (stats.words_mastered / stats.words_in_library) * 100 
    : 0;

  const averageMasteryPercentage = (Number(stats.average_mastery) / 5) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.words_in_library}</div>
            <div className="text-xs text-muted-foreground">Words in Library</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{stats.words_mastered}</div>
            <div className="text-xs text-muted-foreground">Words Mastered</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Mastery Rate</span>
              <span>{masteryPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={masteryPercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Average Mastery Level</span>
              <span>{Number(stats.average_mastery).toFixed(1)}/5.0</span>
            </div>
            <Progress value={averageMasteryPercentage} className="h-2" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Study Sessions</span>
          <Badge variant="secondary">
            <Target className="h-3 w-3 mr-1" />
            {stats.study_sessions_count}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
