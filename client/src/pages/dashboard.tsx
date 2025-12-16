import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Flame,
  Target,
  Clock,
  TrendingUp,
  ChevronRight,
  Mic,
  Music,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/progress-ring";
import { PhaseCard } from "@/components/phase-card";
import { phases, type User, type Exercise, type ExerciseProgress } from "@shared/schema";

interface DashboardData {
  user: User;
  recentExercises: { exercise: Exercise; progress: ExerciseProgress }[];
  weeklyStats: {
    practiceMinutes: number;
    exercisesCompleted: number;
    averageScore: number;
    goalMinutes: number;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const { user, recentExercises, weeklyStats } = data;
  const weekProgress = Math.min((weeklyStats.practiceMinutes / weeklyStats.goalMinutes) * 100, 100);

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-welcome">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Phase {user.currentPhase} - Week {user.currentWeek} of your singing journey
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-streak">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-weekly-goal">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{Math.round(weekProgress)}%</p>
                <p className="text-sm text-muted-foreground">Weekly Goal</p>
                <Progress value={weekProgress} className="mt-2 h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-practice-time">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weeklyStats.practiceMinutes}</p>
                <p className="text-sm text-muted-foreground">Minutes This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-average-score">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(weeklyStats.averageScore)}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Learning Path</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isUnlocked={phase.id <= user.currentPhase}
                isCompleted={phase.id < user.currentPhase}
                progress={
                  phase.id === user.currentPhase
                    ? ((user.currentWeek - (phase.id - 1) * 4) / 4) * 100
                    : phase.id < user.currentPhase
                    ? 100
                    : 0
                }
                onClick={() => setLocation(`/phase/${phase.id}`)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-4"
              onClick={() => setLocation("/practice")}
              data-testid="button-quick-practice"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Start Practice</p>
                  <p className="text-xs text-muted-foreground">Voice exercises</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </Button>

            {user.currentPhase >= 2 && (
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4"
                onClick={() => setLocation("/songs")}
                data-testid="button-browse-songs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Browse Songs</p>
                    <p className="text-xs text-muted-foreground">Find songs to practice</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {user.currentPhase >= 3 && (
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4"
                onClick={() => setLocation("/perform")}
                data-testid="button-virtual-stage"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Virtual Stage</p>
                    <p className="text-xs text-muted-foreground">Practice performing</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {recentExercises.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/practice")}>
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentExercises.slice(0, 3).map(({ exercise, progress }) => (
              <Card key={progress.id} data-testid={`card-recent-${exercise.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <ProgressRing
                      progress={progress.overallScore || 0}
                      size={48}
                      strokeWidth={4}
                      showLabel={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {Math.round(progress.overallScore || 0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
