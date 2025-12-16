import {
  type User,
  type InsertUser,
  type Exercise,
  type InsertExercise,
  type ExerciseProgress,
  type InsertExerciseProgress,
  type VoiceAnalysis,
  type InsertVoiceAnalysis,
  type Song,
  type InsertSong,
  type PracticeRoutine,
  type InsertPracticeRoutine,
  type Performance,
  type InsertPerformance,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getFirstUser(): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  resetUserProgress(id: string): Promise<User | undefined>;

  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getExercisesByPhase(phase: number): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Exercise progress operations
  getExerciseProgress(userId: string): Promise<ExerciseProgress[]>;
  getExerciseProgressByExercise(userId: string, exerciseId: string): Promise<ExerciseProgress | undefined>;
  createExerciseProgress(progress: InsertExerciseProgress): Promise<ExerciseProgress>;
  updateExerciseProgress(id: string, updates: Partial<ExerciseProgress>): Promise<ExerciseProgress | undefined>;

  // Voice analysis operations
  getVoiceAnalyses(userId: string): Promise<VoiceAnalysis[]>;
  createVoiceAnalysis(analysis: InsertVoiceAnalysis): Promise<VoiceAnalysis>;

  // Song operations
  getSongs(): Promise<Song[]>;
  getSongsByVocalRange(vocalRange: string): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  createSong(song: InsertSong): Promise<Song>;

  // Practice routine operations
  getPracticeRoutine(userId: string, week: number): Promise<PracticeRoutine | undefined>;
  createPracticeRoutine(routine: InsertPracticeRoutine): Promise<PracticeRoutine>;
  updatePracticeRoutine(id: string, updates: Partial<PracticeRoutine>): Promise<PracticeRoutine | undefined>;

  // Performance operations
  getPerformances(userId: string): Promise<Performance[]>;
  createPerformance(performance: InsertPerformance): Promise<Performance>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private exercises: Map<string, Exercise>;
  private exerciseProgress: Map<string, ExerciseProgress>;
  private voiceAnalyses: Map<string, VoiceAnalysis>;
  private songs: Map<string, Song>;
  private practiceRoutines: Map<string, PracticeRoutine>;
  private performances: Map<string, Performance>;

  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.exerciseProgress = new Map();
    this.voiceAnalyses = new Map();
    this.songs = new Map();
    this.practiceRoutines = new Map();
    this.performances = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed exercises for Phase 1
    const phase1Exercises: InsertExercise[] = [
      {
        name: "Lip Trill Warm-Up",
        description: "Relax your lips and produce a 'brrr' sound while sliding up and down your range",
        phase: 1,
        category: "warmup",
        difficulty: "easy",
        durationMinutes: 3,
        instructions: "1. Take a deep breath\n2. Relax your lips completely\n3. Exhale while making a 'brrr' sound\n4. Slide from low to high and back down\n5. Repeat 5 times",
      },
      {
        name: "Humming Scale",
        description: "Gently hum through a major scale to warm up your voice",
        phase: 1,
        category: "warmup",
        difficulty: "easy",
        durationMinutes: 4,
        instructions: "1. Start on a comfortable low note\n2. Hum up the major scale (do-re-mi-fa-sol-la-ti-do)\n3. Come back down\n4. Move up a half step and repeat",
      },
      {
        name: "Breath Support Exercise",
        description: "Build diaphragmatic breathing strength for better vocal support",
        phase: 1,
        category: "technique",
        difficulty: "medium",
        durationMinutes: 5,
        instructions: "1. Lie flat on your back\n2. Place a book on your belly\n3. Breathe in deeply, raising the book\n4. Exhale slowly with a 'sss' sound\n5. Maintain even pressure for 10-15 seconds\n6. Repeat 8 times",
      },
      {
        name: "Single Pitch Accuracy",
        description: "Train your ear and voice to match single pitches accurately",
        phase: 1,
        category: "technique",
        difficulty: "easy",
        durationMinutes: 5,
        instructions: "1. Listen to the reference pitch\n2. Match it with your voice\n3. Hold for 3 seconds\n4. Check your accuracy\n5. Adjust if needed and try again",
      },
      {
        name: "Vowel Clarity Exercise",
        description: "Practice clear vowel formation for better tone quality",
        phase: 1,
        category: "technique",
        difficulty: "medium",
        durationMinutes: 4,
        instructions: "1. Sing 'Ah-Eh-Ee-Oh-Oo' on a single comfortable pitch\n2. Keep jaw relaxed and open\n3. Transition smoothly between vowels\n4. Repeat on different pitches",
      },
    ];

    // Seed exercises for Phase 2
    const phase2Exercises: InsertExercise[] = [
      {
        name: "Dynamic Control",
        description: "Practice crescendo and decrescendo for expressive singing",
        phase: 2,
        category: "technique",
        difficulty: "medium",
        durationMinutes: 5,
        instructions: "1. Start on a comfortable pitch very softly\n2. Gradually increase volume over 5 seconds\n3. Hold at full volume for 2 seconds\n4. Decrease volume back to soft over 5 seconds\n5. Repeat on different pitches",
      },
      {
        name: "Phrase Shaping",
        description: "Learn to shape musical phrases with emotion",
        phase: 2,
        category: "technique",
        difficulty: "hard",
        durationMinutes: 6,
        instructions: "1. Choose a simple melody\n2. Identify the emotional peak of the phrase\n3. Build intensity toward the peak\n4. Release tension after the peak\n5. Practice with different emotions",
      },
      {
        name: "Style Exploration",
        description: "Experiment with different vocal styles and genres",
        phase: 2,
        category: "technique",
        difficulty: "medium",
        durationMinutes: 7,
        instructions: "1. Choose a simple song\n2. Sing it in pop style\n3. Try it in jazz style with improvisation\n4. Attempt a classical approach\n5. Notice how each style changes your technique",
      },
      {
        name: "Vibrato Development",
        description: "Develop natural vibrato for richer vocal tone",
        phase: 2,
        category: "technique",
        difficulty: "hard",
        durationMinutes: 5,
        instructions: "1. Sing a sustained comfortable pitch\n2. Keep throat and jaw relaxed\n3. Allow natural oscillation to develop\n4. Don't force the vibrato\n5. Practice on different pitches",
      },
    ];

    // Seed exercises for Phase 3
    const phase3Exercises: InsertExercise[] = [
      {
        name: "Stage Presence",
        description: "Build confidence with virtual audience practice",
        phase: 3,
        category: "performance",
        difficulty: "medium",
        durationMinutes: 8,
        instructions: "1. Stand in front of a mirror\n2. Imagine an audience before you\n3. Perform your song with eye contact\n4. Use natural gestures\n5. Practice entering and exiting the stage",
      },
      {
        name: "Performance Run-Through",
        description: "Complete performance simulation with feedback",
        phase: 3,
        category: "performance",
        difficulty: "hard",
        durationMinutes: 10,
        instructions: "1. Prepare your performance song\n2. Warm up with light exercises\n3. Perform the complete song\n4. Receive virtual audience feedback\n5. Review and improve",
      },
      {
        name: "Microphone Technique",
        description: "Learn proper microphone handling and positioning",
        phase: 3,
        category: "performance",
        difficulty: "medium",
        durationMinutes: 6,
        instructions: "1. Hold microphone at 45-degree angle\n2. Keep consistent distance (2-3 inches)\n3. Pull back on loud notes\n4. Move closer for soft passages\n5. Avoid covering the mic head",
      },
      {
        name: "Recovery Techniques",
        description: "Learn to recover gracefully from performance mistakes",
        phase: 3,
        category: "performance",
        difficulty: "hard",
        durationMinutes: 5,
        instructions: "1. Intentionally make a small mistake while singing\n2. Keep going without stopping\n3. Maintain your stage presence\n4. Refocus on the next phrase\n5. Practice until recovery feels natural",
      },
    ];

    // Add all exercises
    [...phase1Exercises, ...phase2Exercises, ...phase3Exercises].forEach((exercise) => {
      const id = randomUUID();
      this.exercises.set(id, { ...exercise, id });
    });

    // Seed songs
    const songsData: InsertSong[] = [
      { title: "Yesterday", artist: "The Beatles", genre: "Pop", difficulty: "easy", vocalRange: "tenor", bpm: 76, key: "F major" },
      { title: "Someone Like You", artist: "Adele", genre: "Pop", difficulty: "medium", vocalRange: "alto", bpm: 68, key: "A major" },
      { title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", difficulty: "hard", vocalRange: "tenor", bpm: 72, key: "Bb major" },
      { title: "Hallelujah", artist: "Leonard Cohen", genre: "Folk", difficulty: "medium", vocalRange: "baritone", bpm: 56, key: "C major" },
      { title: "Stay With Me", artist: "Sam Smith", genre: "Soul", difficulty: "medium", vocalRange: "tenor", bpm: 84, key: "Am" },
      { title: "Shallow", artist: "Lady Gaga", genre: "Pop", difficulty: "medium", vocalRange: "alto", bpm: 96, key: "G major" },
      { title: "Take Me Home", artist: "John Denver", genre: "Country", difficulty: "easy", vocalRange: "baritone", bpm: 82, key: "A major" },
      { title: "Imagine", artist: "John Lennon", genre: "Pop", difficulty: "easy", vocalRange: "tenor", bpm: 76, key: "C major" },
      { title: "Rolling in the Deep", artist: "Adele", genre: "Pop", difficulty: "hard", vocalRange: "alto", bpm: 105, key: "C minor" },
      { title: "Bridge Over Troubled Water", artist: "Simon & Garfunkel", genre: "Folk", difficulty: "hard", vocalRange: "tenor", bpm: 82, key: "Eb major" },
      { title: "Amazing Grace", artist: "Traditional", genre: "Gospel", difficulty: "easy", vocalRange: "soprano", bpm: 60, key: "G major" },
      { title: "All of Me", artist: "John Legend", genre: "R&B", difficulty: "medium", vocalRange: "tenor", bpm: 63, key: "Ab major" },
    ];

    songsData.forEach((song) => {
      const id = randomUUID();
      this.songs.set(id, { ...song, id });
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.name === username);
  }

  async getFirstUser(): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      name: insertUser.name,
      experienceLevel: insertUser.experienceLevel,
      vocalRange: insertUser.vocalRange || null,
      currentPhase: 3, // Start at Phase 3 to unlock all features
      currentWeek: 9,  // Week 9 (Phase 3 territory)
      totalPracticeMinutes: 0,
      streak: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async resetUserProgress(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const resetUser: User = {
      ...user,
      currentPhase: 1,
      currentWeek: 1,
      totalPracticeMinutes: 0,
      streak: 0,
    };
    this.users.set(id, resetUser);
    
    // Clear user's exercise progress
    Array.from(this.exerciseProgress.entries())
      .filter(([, progress]) => progress.userId === id)
      .forEach(([key]) => this.exerciseProgress.delete(key));
    
    return resetUser;
  }

  // Exercise operations
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByPhase(phase: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter((e) => e.phase === phase);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const newExercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  // Exercise progress operations
  async getExerciseProgress(userId: string): Promise<ExerciseProgress[]> {
    return Array.from(this.exerciseProgress.values()).filter(
      (p) => p.userId === userId
    );
  }

  async getExerciseProgressByExercise(
    userId: string,
    exerciseId: string
  ): Promise<ExerciseProgress | undefined> {
    return Array.from(this.exerciseProgress.values()).find(
      (p) => p.userId === userId && p.exerciseId === exerciseId
    );
  }

  async createExerciseProgress(
    progress: InsertExerciseProgress
  ): Promise<ExerciseProgress> {
    const id = randomUUID();
    const newProgress: ExerciseProgress = {
      id,
      userId: progress.userId,
      exerciseId: progress.exerciseId,
      completed: progress.completed ?? false,
      pitchScore: progress.pitchScore ?? null,
      toneScore: progress.toneScore ?? null,
      breathingScore: progress.breathingScore ?? null,
      overallScore: progress.overallScore ?? null,
      completedAt: progress.completedAt ?? null,
      feedback: progress.feedback ?? null,
    };
    this.exerciseProgress.set(id, newProgress);
    return newProgress;
  }

  async updateExerciseProgress(
    id: string,
    updates: Partial<ExerciseProgress>
  ): Promise<ExerciseProgress | undefined> {
    const progress = this.exerciseProgress.get(id);
    if (!progress) return undefined;
    const updatedProgress = { ...progress, ...updates };
    this.exerciseProgress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Voice analysis operations
  async getVoiceAnalyses(userId: string): Promise<VoiceAnalysis[]> {
    return Array.from(this.voiceAnalyses.values()).filter(
      (a) => a.userId === userId
    );
  }

  async createVoiceAnalysis(
    analysis: InsertVoiceAnalysis
  ): Promise<VoiceAnalysis> {
    const id = randomUUID();
    const newAnalysis = { ...analysis, id };
    this.voiceAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }

  // Song operations
  async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSongsByVocalRange(vocalRange: string): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(
      (s) => s.vocalRange.toLowerCase() === vocalRange.toLowerCase()
    );
  }

  async getSong(id: string): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async createSong(song: InsertSong): Promise<Song> {
    const id = randomUUID();
    const newSong = { ...song, id };
    this.songs.set(id, newSong);
    return newSong;
  }

  // Practice routine operations
  async getPracticeRoutine(
    userId: string,
    week: number
  ): Promise<PracticeRoutine | undefined> {
    return Array.from(this.practiceRoutines.values()).find(
      (r) => r.userId === userId && r.week === week
    );
  }

  async createPracticeRoutine(
    routine: InsertPracticeRoutine
  ): Promise<PracticeRoutine> {
    const id = randomUUID();
    const newRoutine: PracticeRoutine = {
      id,
      userId: routine.userId,
      week: routine.week,
      exerciseIds: routine.exerciseIds,
      goalMinutes: routine.goalMinutes,
      completedMinutes: routine.completedMinutes ?? 0,
    };
    this.practiceRoutines.set(id, newRoutine);
    return newRoutine;
  }

  async updatePracticeRoutine(
    id: string,
    updates: Partial<PracticeRoutine>
  ): Promise<PracticeRoutine | undefined> {
    const routine = this.practiceRoutines.get(id);
    if (!routine) return undefined;
    const updatedRoutine = { ...routine, ...updates };
    this.practiceRoutines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  // Performance operations
  async getPerformances(userId: string): Promise<Performance[]> {
    return Array.from(this.performances.values()).filter(
      (p) => p.userId === userId
    );
  }

  async createPerformance(performance: InsertPerformance): Promise<Performance> {
    const id = randomUUID();
    const newPerformance: Performance = {
      id,
      userId: performance.userId,
      songId: performance.songId ?? null,
      audienceReactions: performance.audienceReactions ?? null,
      performanceScore: performance.performanceScore ?? null,
      stageEffects: performance.stageEffects ?? null,
      performedAt: performance.performedAt,
    };
    this.performances.set(id, newPerformance);
    return newPerformance;
  }
}

export const storage = new MemStorage();
