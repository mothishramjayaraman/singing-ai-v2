import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile with singing preferences
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  experienceLevel: text("experience_level").notNull(), // beginner, intermediate, advanced
  vocalRange: text("vocal_range"), // soprano, alto, tenor, bass, baritone
  currentPhase: integer("current_phase").notNull().default(1),
  currentWeek: integer("current_week").notNull().default(1),
  totalPracticeMinutes: integer("total_practice_minutes").notNull().default(0),
  streak: integer("streak").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  experienceLevel: true,
  vocalRange: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Exercise definitions
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  phase: integer("phase").notNull(), // 1, 2, or 3
  category: text("category").notNull(), // warmup, technique, performance
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  durationMinutes: integer("duration_minutes").notNull(),
  instructions: text("instructions").notNull(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

// User exercise progress
export const exerciseProgress = pgTable("exercise_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  oderId: varchar("user_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  pitchScore: real("pitch_score"),
  toneScore: real("tone_score"),
  breathingScore: real("breathing_score"),
  overallScore: real("overall_score"),
  completedAt: text("completed_at"),
  feedback: text("feedback"),
});

export const insertExerciseProgressSchema = createInsertSchema(exerciseProgress).omit({
  id: true,
});

export type InsertExerciseProgress = z.infer<typeof insertExerciseProgressSchema>;
export type ExerciseProgress = typeof exerciseProgress.$inferSelect;

// Voice analysis results
export const voiceAnalysis = pgTable("voice_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  pitchAccuracy: real("pitch_accuracy").notNull(),
  toneStability: real("tone_stability").notNull(),
  breathingConsistency: real("breathing_consistency").notNull(),
  overallRating: real("overall_rating").notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
  analyzedAt: text("analyzed_at").notNull(),
});

export const insertVoiceAnalysisSchema = createInsertSchema(voiceAnalysis).omit({
  id: true,
});

export type InsertVoiceAnalysis = z.infer<typeof insertVoiceAnalysisSchema>;
export type VoiceAnalysis = typeof voiceAnalysis.$inferSelect;

// Song recommendations
export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  genre: text("genre").notNull(),
  difficulty: text("difficulty").notNull(),
  vocalRange: text("vocal_range").notNull(),
  bpm: integer("bpm").notNull(),
  key: text("key").notNull(),
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
});

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

// Practice routines
export const practiceRoutines = pgTable("practice_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  week: integer("week").notNull(),
  exerciseIds: jsonb("exercise_ids").$type<string[]>().notNull(),
  goalMinutes: integer("goal_minutes").notNull(),
  completedMinutes: integer("completed_minutes").notNull().default(0),
});

export const insertPracticeRoutineSchema = createInsertSchema(practiceRoutines).omit({
  id: true,
});

export type InsertPracticeRoutine = z.infer<typeof insertPracticeRoutineSchema>;
export type PracticeRoutine = typeof practiceRoutines.$inferSelect;

// Performance sessions
export const performances = pgTable("performances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  songId: varchar("song_id"),
  audienceReactions: jsonb("audience_reactions").$type<string[]>(),
  performanceScore: real("performance_score"),
  stageEffects: jsonb("stage_effects").$type<string[]>(),
  performedAt: text("performed_at").notNull(),
});

export const insertPerformanceSchema = createInsertSchema(performances).omit({
  id: true,
});

export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type Performance = typeof performances.$inferSelect;

// Phase definitions (static data)
export interface Phase {
  id: number;
  name: string;
  description: string;
  weeks: string;
  features: string[];
  unlockCriteria: string;
}

export const phases: Phase[] = [
  {
    id: 1,
    name: "Foundation",
    description: "Build your vocal foundation with essential techniques",
    weeks: "Weeks 1-4",
    features: [
      "Voice recording & analysis",
      "Pitch accuracy training",
      "Tone stability exercises",
      "Breathing techniques",
      "Weekly practice routines"
    ],
    unlockCriteria: "Start your journey"
  },
  {
    id: 2,
    name: "Technique & Expression",
    description: "Develop advanced techniques and emotional expression",
    weeks: "Weeks 5-8",
    features: [
      "Song recommendations",
      "Genre-based backing tracks",
      "Adaptive difficulty",
      "Expression coaching",
      "Style development"
    ],
    unlockCriteria: "Complete Phase 1 with 70% average score"
  },
  {
    id: 3,
    name: "Performance & Confidence",
    description: "Master stage presence and build performance confidence",
    weeks: "Weeks 9-12",
    features: [
      "Virtual performance simulator",
      "Audience reactions",
      "Stage effects",
      "Audio mastering",
      "Performance analysis"
    ],
    unlockCriteria: "Complete Phase 2 with 75% average score"
  }
];
