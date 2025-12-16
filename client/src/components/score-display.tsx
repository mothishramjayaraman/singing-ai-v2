import { ProgressRing } from "./progress-ring";

interface ScoreDisplayProps {
  pitchScore: number;
  toneScore: number;
  breathingScore: number;
  overallScore: number;
  className?: string;
}

export function ScoreDisplay({
  pitchScore,
  toneScore,
  breathingScore,
  overallScore,
  className = "",
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const metrics = [
    { label: "Pitch", score: pitchScore },
    { label: "Tone", score: toneScore },
    { label: "Breathing", score: breathingScore },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-center">
        <div className="text-center">
          <ProgressRing
            progress={overallScore}
            size={120}
            strokeWidth={10}
            showLabel={false}
          />
          <div className="mt-2">
            <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}
            </span>
            <span className="text-muted-foreground text-lg">/100</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map(({ label, score }) => (
          <div key={label} className="text-center">
            <ProgressRing
              progress={score}
              size={64}
              strokeWidth={6}
              showLabel={false}
            />
            <p className={`mt-2 text-2xl font-semibold ${getScoreColor(score)}`}>
              {Math.round(score)}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
