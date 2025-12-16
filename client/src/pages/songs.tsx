import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music, Filter, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SongCard } from "@/components/song-card";
import { generateBackingTrack } from "@/lib/mock-ai";
import type { Song } from "@shared/schema";

interface SongsData {
  songs: Song[];
  recommendedSongs: Song[];
}

export default function Songs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [backingTrack, setBackingTrack] = useState<ReturnType<typeof generateBackingTrack> | null>(null);

  const { data, isLoading } = useQuery<SongsData>({
    queryKey: ["/api/songs"],
  });

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    const track = generateBackingTrack(song.genre, song.bpm, song.key);
    setBackingTrack(track);
  };

  const genres = ["all", "pop", "rock", "folk", "soul", "country", "gospel", "r&b"];
  const difficulties = ["all", "easy", "medium", "hard"];

  const filteredSongs = data?.songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === "all" || song.genre.toLowerCase() === genreFilter;
    const matchesDifficulty = difficultyFilter === "all" || song.difficulty === difficultyFilter;
    return matchesSearch && matchesGenre && matchesDifficulty;
  });

  if (isLoading) {
    return <SongsSkeleton />;
  }

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
          <h1 className="text-2xl font-bold">Song Library</h1>
          <p className="text-muted-foreground">
            Find songs that match your vocal range and style
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-songs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-32" data-testid="select-genre">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre.charAt(0).toUpperCase() + genre.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-32" data-testid="select-difficulty">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff === "all" ? "All Levels" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {data?.recommendedSongs && data.recommendedSongs.length > 0 && !searchQuery && genreFilter === "all" && difficultyFilter === "all" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Recommended for You</h2>
                <Badge variant="secondary">AI Picks</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {data.recommendedSongs.slice(0, 4).map((song) => (
                  <SongCard key={song.id} song={song} onSelect={handleSelectSong} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {searchQuery || genreFilter !== "all" || difficultyFilter !== "all"
                ? "Search Results"
                : "All Songs"}
            </h2>
            {filteredSongs && filteredSongs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSongs.map((song) => (
                  <SongCard key={song.id} song={song} onSelect={handleSelectSong} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No songs found matching your criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {selectedSong && backingTrack ? (
            <Card data-testid="card-selected-song">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Now Playing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSong.title}</h3>
                  <p className="text-muted-foreground">{selectedSong.artist}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Genre</span>
                    <Badge variant="secondary">{selectedSong.genre}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Key</span>
                    <span>{selectedSong.key}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">BPM</span>
                    <span>{selectedSong.bpm}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vocal Range</span>
                    <span className="capitalize">{selectedSong.vocalRange}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium text-sm">AI Backing Track</h4>
                  <p className="text-sm text-muted-foreground">{backingTrack.description}</p>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Backing track simulation
                    </p>
                    <p className="text-sm font-medium">{backingTrack.trackName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.floor(backingTrack.duration / 60)}:{(backingTrack.duration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setLocation("/practice", { 
                    state: { 
                      song: selectedSong, 
                      backingTrack 
                    } 
                  })}
                  data-testid="button-practice-song"
                >
                  Practice This Song
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a song to see details and generate a backing track
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SongsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-9 h-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}
