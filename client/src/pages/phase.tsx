import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Target, Sparkles, Star, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseCard } from "@/components/exercise-card";
import { phases, type Exercise, type User } from "@shared/schema";

interface PhaseData {
  user: User;
  exercises: Exercise[];
  completedIds: string[];
  phaseProgress: number;
}

export default function Phase() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const phaseId = parseInt(params.id || "1");

  const phase = phases.find((p) => p.id === phaseId);

  const { data, isLoading } = useQuery<PhaseData>({
    queryKey: ["/api/phase", phaseId],
  });

  const phaseIcons = {
    1: Target,
    2: Sparkles,
    3: Star,
  };

  const PhaseIcon = phaseIcons[phaseId as keyof typeof phaseIcons] || Target;

  if (isLoading) {
    return <PhaseSkeleton />;
  }

  if (!data || !phase) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Phase Not Available</h2>
        <p className="text-muted-foreground mb-4">
          Complete previous phases to unlock this content.
        </p>
        <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const { user, exercises, completedIds, phaseProgress } = data;
  const isUnlocked = phaseId <= user.currentPhase;

  if (!isUnlocked) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <Lock className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Phase Locked</h2>
        <p className="text-muted-foreground mb-4">{phase.unlockCriteria}</p>
        <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const completedCount = exercises.filter((e) => completedIds.includes(e.id)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <PhaseIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Phase {phaseId}: {phase.name}</h1>
              <p className="text-muted-foreground">{phase.weeks}</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground">{phase.description}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round(phaseProgress)}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              <Progress value={phaseProgress} className="w-32 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Exercises</h2>
            <Badge variant="secondary">
              {completedCount}/{exercises.length} completed
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={completedIds.includes(exercise.id)}
                onStart={() => setLocation("/practice")}
              />
            ))}
          </div>

          {exercises.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No exercises available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What You'll Learn</h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {phase.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {phaseId < 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {user.currentPhase > phaseId ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setLocation(`/phase/${phaseId + 1}`)}
                    >
                      Go to Phase {phaseId + 1}
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 inline mr-2" />
                      {phases[phaseId]?.unlockCriteria}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-9 h-9 rounded-md" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      <Skeleton className="h-24 rounded-lg" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
