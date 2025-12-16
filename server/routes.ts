import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get current user (returns first user for simplicity)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid user data", errors: parsed.error.errors });
      }
      const user = await storage.createUser(parsed.data);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user
  app.patch("/api/user", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset progress
  app.post("/api/reset-progress", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const resetUser = await storage.resetUserProgress(user.id);
      res.json(resetUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const allProgress = await storage.getExerciseProgress(user.id);
      const exercises = await storage.getExercises();

      // Get recent exercises with progress
      const recentExercises = allProgress
        .filter((p) => p.completed)
        .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))
        .slice(0, 5)
        .map((progress) => ({
          exercise: exercises.find((e) => e.id === progress.exerciseId)!,
          progress,
        }))
        .filter((item) => item.exercise);

      // Calculate weekly stats
      const completedThisWeek = allProgress.filter((p) => p.completed);
      const totalMinutes = completedThisWeek.reduce((sum, p) => {
        const exercise = exercises.find((e) => e.id === p.exerciseId);
        return sum + (exercise?.durationMinutes || 0);
      }, 0);
      
      const scores = completedThisWeek
        .map((p) => p.overallScore)
        .filter((s): s is number => s !== null && s !== undefined);
      
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
        : 0;

      res.json({
        user,
        recentExercises,
        weeklyStats: {
          practiceMinutes: user.totalPracticeMinutes,
          exercisesCompleted: completedThisWeek.length,
          averageScore,
          goalMinutes: 60, // Default goal
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      const exercises = await storage.getExercises();
      const progress = user ? await storage.getExerciseProgress(user.id) : [];
      
      const completedIds = progress
        .filter((p) => p.completed)
        .map((p) => p.exerciseId);

      res.json({
        exercises: exercises.filter((e) => e.phase === (user?.currentPhase || 1)),
        completedIds,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get phase data
  app.get("/api/phase/:id", async (req, res) => {
    try {
      const phaseId = parseInt(req.params.id);
      const user = await storage.getFirstUser();
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const exercises = await storage.getExercisesByPhase(phaseId);
      const progress = await storage.getExerciseProgress(user.id);
      
      const phaseProgress = progress.filter((p) => 
        exercises.some((e) => e.id === p.exerciseId)
      );

      const completedIds = phaseProgress
        .filter((p) => p.completed)
        .map((p) => p.exerciseId);

      const progressPercent = exercises.length > 0 
        ? (completedIds.length / exercises.length) * 100 
        : 0;

      res.json({
        user,
        exercises,
        completedIds,
        phaseProgress: progressPercent,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save exercise progress
  app.post("/api/exercise-progress", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { exerciseId, pitchScore, toneScore, breathingScore, overallScore, feedback } = req.body;

      // Check if progress already exists
      const existingProgress = await storage.getExerciseProgressByExercise(user.id, exerciseId);
      
      const exercise = await storage.getExercise(exerciseId);
      
      if (existingProgress) {
        // Update existing progress
        const updated = await storage.updateExerciseProgress(existingProgress.id, {
          pitchScore,
          toneScore,
          breathingScore,
          overallScore,
          feedback,
          completed: true,
          completedAt: new Date().toISOString(),
        });
        
        // Update user practice time
        if (exercise) {
          await storage.updateUser(user.id, {
            totalPracticeMinutes: user.totalPracticeMinutes + exercise.durationMinutes,
          });
        }
        
        res.json(updated);
      } else {
        // Create new progress
        const newProgress = await storage.createExerciseProgress({
          userId: user.id,
          exerciseId,
          completed: true,
          pitchScore,
          toneScore,
          breathingScore,
          overallScore,
          feedback,
          completedAt: new Date().toISOString(),
        });
        
        // Update user practice time
        if (exercise) {
          await storage.updateUser(user.id, {
            totalPracticeMinutes: user.totalPracticeMinutes + exercise.durationMinutes,
          });
        }

        // Check for phase advancement
        const allExercises = await storage.getExercisesByPhase(user.currentPhase);
        const allProgress = await storage.getExerciseProgress(user.id);
        const completedInPhase = allProgress.filter((p) => 
          p.completed && allExercises.some((e) => e.id === p.exerciseId)
        );
        
        if (completedInPhase.length === allExercises.length && user.currentPhase < 3) {
          const avgScore = completedInPhase.reduce((sum, p) => sum + (p.overallScore || 0), 0) / completedInPhase.length;
          
          if (avgScore >= 70) {
            await storage.updateUser(user.id, {
              currentPhase: user.currentPhase + 1,
              currentWeek: user.currentPhase * 4 + 1,
            });
          }
        }
        
        res.status(201).json(newProgress);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get songs
  app.get("/api/songs", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      const allSongs = await storage.getSongs();
      
      let recommendedSongs = allSongs;
      if (user?.vocalRange) {
        const vocalRangeSongs = await storage.getSongsByVocalRange(user.vocalRange);
        recommendedSongs = vocalRangeSongs.length > 0 ? vocalRangeSongs : allSongs.slice(0, 4);
      } else {
        recommendedSongs = allSongs.filter((s) => s.difficulty === "easy").slice(0, 4);
      }

      res.json({
        songs: allSongs,
        recommendedSongs,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save voice analysis
  app.post("/api/voice-analysis", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const analysis = await storage.createVoiceAnalysis({
        userId: user.id,
        pitchAccuracy: req.body.pitchAccuracy,
        toneStability: req.body.toneStability,
        breathingConsistency: req.body.breathingConsistency,
        overallRating: req.body.overallRating,
        suggestions: req.body.suggestions || [],
        analyzedAt: new Date().toISOString(),
      });

      res.status(201).json(analysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get voice analyses
  app.get("/api/voice-analyses", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const analyses = await storage.getVoiceAnalyses(user.id);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create performance
  app.post("/api/performances", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const performance = await storage.createPerformance({
        userId: user.id,
        songId: req.body.songId || null,
        audienceReactions: req.body.audienceReactions || [],
        performanceScore: req.body.performanceScore || null,
        stageEffects: req.body.stageEffects || [],
        performedAt: new Date().toISOString(),
      });

      res.status(201).json(performance);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get performances
  app.get("/api/performances", async (req, res) => {
    try {
      const user = await storage.getFirstUser();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const performances = await storage.getPerformances(user.id);
      res.json(performances);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
