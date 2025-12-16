import { useState } from "react";
import { useLocation } from "wouter";
import { Mic, Music, Target, ChevronRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";

const onboardingSchema = insertUserSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  vocalRange: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      experienceLevel: "beginner",
      vocalRange: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setLocation("/dashboard");
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    createUserMutation.mutate(data);
  };

  const experienceLevels = [
    {
      value: "beginner",
      label: "Beginner",
      description: "New to singing or just starting formal training",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some experience with singing and basic techniques",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Extensive training or professional experience",
    },
  ];

  const vocalRanges = [
    { value: "soprano", label: "Soprano", description: "Highest female voice" },
    { value: "alto", label: "Alto", description: "Lower female voice" },
    { value: "tenor", label: "Tenor", description: "Higher male voice" },
    { value: "baritone", label: "Baritone", description: "Medium male voice" },
    { value: "bass", label: "Bass", description: "Lowest male voice" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-xl">SingSmart AI</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Welcome to SingSmart AI</h2>
                  <p className="text-muted-foreground">
                    Let's personalize your singing journey
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your name?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={() => {
                    if (form.getValues("name").length >= 2) {
                      setStep(2);
                    } else {
                      form.trigger("name");
                    }
                  }}
                  className="w-full"
                  data-testid="button-next-step-1"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Your Experience Level</h2>
                  <p className="text-muted-foreground">
                    This helps us customize your learning path
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                        >
                          {experienceLevels.map((level) => (
                            <label
                              key={level.value}
                              className="cursor-pointer"
                              data-testid={`radio-${level.value}`}
                            >
                              <Card
                                className={`transition-all hover-elevate ${
                                  field.value === level.value
                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                    : ""
                                }`}
                              >
                                <CardContent className="p-4 flex items-center gap-4">
                                  <RadioGroupItem value={level.value} />
                                  <div>
                                    <p className="font-medium">{level.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {level.description}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    data-testid="button-back-step-2"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1"
                    data-testid="button-next-step-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Music className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Your Vocal Range</h2>
                  <p className="text-muted-foreground">
                    Optional - We'll help you discover it if you're unsure
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="vocalRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select your vocal range (optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-vocal-range">
                            <SelectValue placeholder="Choose your vocal range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vocalRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              <div className="flex items-center gap-2">
                                <span>{range.label}</span>
                                <span className="text-muted-foreground">
                                  - {range.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    data-testid="button-back-step-3"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createUserMutation.isPending}
                    data-testid="button-start-journey"
                  >
                    {createUserMutation.isPending ? (
                      "Creating profile..."
                    ) : (
                      <>
                        Start Your Journey
                        <Sparkles className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </main>
    </div>
  );
}
