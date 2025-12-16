import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Mic,
  Square,
  Users,
  Star,
  Sparkles,
  Volume2,
  Music,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { AudioPlayer } from "@/components/audio-player";
import { ScoreDisplay } from "@/components/score-display";
import { analyzeVoice, generateAudienceReactions, applyAudioMastering } from "@/lib/mock-ai";
import type { VoiceAnalysis } from "@shared/schema";

type PerformanceState = "idle" | "performing" | "analyzing" | "results";

export default function Perform() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<PerformanceState>("idle");
  const [analysisResult, setAnalysisResult] = useState<Omit<VoiceAnalysis, "id"> | null>(null);
  const [audienceReaction, setAudienceReaction] = useState<ReturnType<typeof generateAudienceReactions> | null>(null);
  const [masteringOptions, setMasteringOptions] = useState({
    normalizeVolume: true,
    enhanceClarity: true,
    addReverb: false,
  });
  const [isMastering, setIsMastering] = useState(false);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);

  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    analyserData,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleStartPerformance = async () => {
    setState("performing");
    await startRecording();
  };

  const handleStopPerformance = () => {
    stopRecording();
    setState("analyzing");
    
    setTimeout(async () => {
      if (audioBlob) {
        const analysis = await analyzeVoice(audioBlob);
        setAnalysisResult(analysis);
        
        const reactions = generateAudienceReactions(analysis.overallRating);
        setAudienceReaction(reactions);
        
        setState("results");
      }
    }, 500);
  };

  const handleApplyMastering = async () => {
    if (!audioBlob) return;

    setIsMastering(true);
    try {
      const mastered = await applyAudioMastering(audioBlob, masteringOptions);
      const url = URL.createObjectURL(mastered);
      setMasteredAudioUrl(url);
    } catch (err) {
      console.error("Mastering failed:", err);
    } finally {
      setIsMastering(false);
    }
  };

  const handleReset = () => {
    resetRecording();
    setAnalysisResult(null);
    setAudienceReaction(null);
    setMasteredAudioUrl(null);
    setState("idle");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getApplauseEmoji = (level: string) => {
    const icons: Record<string, { icon: typeof Star; count: number }> = {
      light: { icon: Star, count: 1 },
      moderate: { icon: Star, count: 2 },
      enthusiastic: { icon: Star, count: 3 },
      standing_ovation: { icon: Sparkles, count: 4 },
    };
    return icons[level] || icons.light;
  };

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
          <h1 className="text-2xl font-bold">Virtual Performance Stage</h1>
          <p className="text-muted-foreground">
            Practice performing with simulated audience feedback
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden" data-testid="card-stage">
            <div
              className="relative h-80 bg-gradient-to-b from-primary/20 via-primary/5 to-background flex flex-col items-center justify-center"
              style={{
                backgroundImage:
                  state === "performing"
                    ? "radial-gradient(circle at center, hsl(var(--primary) / 0.3) 0%, transparent 70%)"
                    : undefined,
              }}
            >
              {state === "idle" && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mic className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Ready to Perform?</h2>
                    <p className="text-muted-foreground">
                      Step onto the virtual stage and show your skills
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleStartPerformance}
                    data-testid="button-start-performance"
                  >
                    <Mic className="h-5 w-5 mr-2" />
                    Take the Stage
                  </Button>
                </div>
              )}

              {state === "performing" && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center mx-auto animate-pulse">
                    <Mic className="h-12 w-12 text-white" />
                  </div>
                  <WaveformVisualizer
                    analyserData={analyserData}
                    isRecording={isRecording}
                    className="w-64 h-16"
                  />
                  <div className="text-4xl font-mono tabular-nums">{formatTime(duration)}</div>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStopPerformance}
                    data-testid="button-stop-performance"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    End Performance
                  </Button>
                </div>
              )}

              {state === "analyzing" && (
                <div className="text-center space-y-6">
                  <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                  <div>
                    <h2 className="text-xl font-semibold">Analyzing Performance</h2>
                    <p className="text-muted-foreground">
                      The audience is listening...
                    </p>
                  </div>
                </div>
              )}

              {state === "results" && audienceReaction && (
                <div className="text-center space-y-4 p-6">
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: getApplauseEmoji(audienceReaction.applauseLevel).count }).map(
                      (_, i) => {
                        const Icon = getApplauseEmoji(audienceReaction.applauseLevel).icon;
                        return (
                          <Icon
                            key={i}
                            className="h-8 w-8 text-yellow-500 animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        );
                      }
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {audienceReaction.reactions.map((reaction, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {reaction}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {audienceReaction.feedback}
                  </p>
                </div>
              )}
            </div>

            {state === "results" && audioUrl && (
              <CardContent className="p-6 border-t space-y-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Audience Reaction</h3>
                  <Badge
                    variant="outline"
                    className="ml-auto capitalize"
                  >
                    {audienceReaction?.applauseLevel.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your Recording</h4>
                  <AudioPlayer audioUrl={masteredAudioUrl || audioUrl} />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                  data-testid="button-perform-again"
                >
                  Perform Again
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {state === "results" && analysisResult && (
            <Card data-testid="card-performance-score">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreDisplay
                  pitchScore={analysisResult.pitchAccuracy}
                  toneScore={analysisResult.toneStability}
                  breathingScore={analysisResult.breathingConsistency}
                  overallScore={analysisResult.overallRating}
                />
              </CardContent>
            </Card>
          )}

          {state === "results" && audioBlob && (
            <Card data-testid="card-audio-mastering">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio Mastering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enhance your recording with basic audio processing
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="normalize" className="text-sm">
                      Normalize Volume
                    </Label>
                    <Switch
                      id="normalize"
                      checked={masteringOptions.normalizeVolume}
                      onCheckedChange={(checked) =>
                        setMasteringOptions((prev) => ({
                          ...prev,
                          normalizeVolume: checked,
                        }))
                      }
                      data-testid="switch-normalize"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="clarity" className="text-sm">
                      Enhance Clarity
                    </Label>
                    <Switch
                      id="clarity"
                      checked={masteringOptions.enhanceClarity}
                      onCheckedChange={(checked) =>
                        setMasteringOptions((prev) => ({
                          ...prev,
                          enhanceClarity: checked,
                        }))
                      }
                      data-testid="switch-clarity"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reverb" className="text-sm">
                      Add Reverb
                    </Label>
                    <Switch
                      id="reverb"
                      checked={masteringOptions.addReverb}
                      onCheckedChange={(checked) =>
                        setMasteringOptions((prev) => ({
                          ...prev,
                          addReverb: checked,
                        }))
                      }
                      data-testid="switch-reverb"
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleApplyMastering}
                  disabled={isMastering}
                  data-testid="button-apply-mastering"
                >
                  {isMastering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Apply Mastering"
                  )}
                </Button>

                {masteredAudioUrl && (
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    Mastering applied successfully
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {state === "idle" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Performance Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Warm up your voice before performing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Stand in a comfortable position</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Breathe deeply before starting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Perform with emotion and confidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>Imagine a supportive audience</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
