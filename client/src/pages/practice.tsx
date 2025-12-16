import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mic, Square, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { AudioPlayer } from "@/components/audio-player";
import { ScoreDisplay } from "@/components/score-display";
import { ExerciseCard } from "@/components/exercise-card";
import { analyzeVoice } from "@/lib/mock-ai";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Exercise, VoiceAnalysis } from "@shared/schema";

interface PracticeData {
  exercises: Exercise[];
  completedIds: string[];
}

export default function Practice() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Omit<VoiceAnalysis, "id"> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    analyserData,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const { data, isLoading } = useQuery<PracticeData>({
    queryKey: ["/api/exercises"],
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (analysis: Omit<VoiceAnalysis, "id">) => {
      if (!selectedExercise) return;
      const response = await apiRequest("POST", "/api/exercise-progress", {
        exerciseId: selectedExercise.id,
        pitchScore: analysis.pitchAccuracy,
        toneScore: analysis.toneStability,
        breathingScore: analysis.breathingConsistency,
        overallScore: analysis.overallRating,
        feedback: analysis.suggestions.join("; "),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const saveVoiceAnalysisMutation = useMutation({
    mutationFn: async (analysis: Omit<VoiceAnalysis, "id">) => {
      const response = await apiRequest("POST", "/api/voice-analysis", analysis);
      return response.json();
    },
  });

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeVoice(audioBlob);
      setAnalysisResult(result);
      saveProgressMutation.mutate(result);
      saveVoiceAnalysisMutation.mutate(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    resetRecording();
    setAnalysisResult(null);
  };

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <PracticeSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Voice Practice</h1>
        <p className="text-muted-foreground">
          Record your voice and get instant AI-powered feedback
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-recorder">
            <CardHeader>
              <CardTitle>
                {selectedExercise ? selectedExercise.name : "Voice Recorder"}
              </CardTitle>
              <CardDescription>
                {selectedExercise
                  ? selectedExercise.description
                  : "Select an exercise or record freely"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {selectedExercise && !audioUrl && !isRecording && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedExercise.instructions}
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center space-y-6">
                <WaveformVisualizer
                  analyserData={analyserData}
                  isRecording={isRecording}
                  className="h-20"
                />

                <div className="text-4xl font-mono tabular-nums" data-testid="text-duration">
                  {formatTime(duration)}
                </div>

                <div className="flex items-center gap-4">
                  {!isRecording && !audioUrl && (
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="w-20 h-20 rounded-full"
                      data-testid="button-start-recording"
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full animate-pulse"
                      data-testid="button-stop-recording"
                    >
                      <Square className="h-8 w-8" />
                    </Button>
                  )}

                  {audioUrl && !analysisResult && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleReset}
                        data-testid="button-reset"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        data-testid="button-analyze"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Voice"
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {audioUrl && (
                  <div className="w-full max-w-md">
                    <AudioPlayer audioUrl={audioUrl} />
                  </div>
                )}
              </div>

              {analysisResult && (
                <div className="space-y-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-center">Analysis Results</h3>
                  <ScoreDisplay
                    pitchScore={analysisResult.pitchAccuracy}
                    toneScore={analysisResult.toneStability}
                    breathingScore={analysisResult.breathingConsistency}
                    overallScore={analysisResult.overallRating}
                  />

                  <div className="space-y-3">
                    <h4 className="font-medium">Suggestions for Improvement</h4>
                    <ul className="space-y-2">
                      {analysisResult.suggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                    data-testid="button-try-again"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Exercises</h2>
          <div className="space-y-3">
            {data?.exercises.slice(0, 5).map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={data.completedIds.includes(exercise.id)}
                onStart={handleStartExercise}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
