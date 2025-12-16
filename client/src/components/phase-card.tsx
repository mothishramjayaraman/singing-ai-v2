import { Lock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "./progress-ring";
import type { Phase } from "@shared/schema";

interface PhaseCardProps {
  phase: Phase;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
  onClick: () => void;
}

export function PhaseCard({
  phase,
  isUnlocked,
  isCompleted,
  progress,
  onClick,
}: PhaseCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-all hover-elevate ${
        !isUnlocked ? "opacity-60" : ""
      }`}
      onClick={isUnlocked ? onClick : undefined}
      data-testid={`card-phase-${phase.id}`}
    >
      <div className="absolute top-4 right-4">
        <Badge variant="secondary" className="font-mono">
          {phase.weeks}
        </Badge>
      </div>

      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg z-10">
          <Lock className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <ProgressRing progress={progress} size={48} strokeWidth={4} />
          )}
          <div>
            <h3 className="font-bold text-xl">Phase {phase.id}</h3>
            <p className="text-sm font-medium text-primary">{phase.name}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{phase.description}</p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Features
          </p>
          <ul className="space-y-1">
            {phase.features.slice(0, 3).map((feature, idx) => (
              <li
                key={idx}
                className="text-sm flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                {feature}
              </li>
            ))}
            {phase.features.length > 3 && (
              <li className="text-sm text-muted-foreground">
                +{phase.features.length - 3} more
              </li>
            )}
          </ul>
        </div>

        {!isUnlocked && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              <Lock className="h-3 w-3 inline mr-1" />
              {phase.unlockCriteria}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
