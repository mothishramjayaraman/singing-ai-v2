import { Music, Clock3, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Song } from "@shared/schema";

interface SongCardProps {
  song: Song;
  onSelect: (song: Song) => void;
}

export function SongCard({ song, onSelect }: SongCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={() => onSelect(song)}
      data-testid={`card-song-${song.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{song.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            </div>
          </div>
          <Badge variant="secondary" className={getDifficultyColor(song.difficulty)}>
            {song.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Badge variant="outline">{song.genre}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            <span>{song.bpm} BPM</span>
          </div>
          <div className="flex items-center gap-1">
            <Music className="h-3.5 w-3.5" />
            <span>{song.key}</span>
          </div>
        </div>
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs">
            {song.vocalRange}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
