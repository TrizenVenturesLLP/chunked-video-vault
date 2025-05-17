
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Film, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoLoaded = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
    toast.error("Failed to load video. The video might not be properly stored or accessible.");
    console.error("Video failed to load:", videoUrl);
  };

  return (
    <Card className="overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-medium truncate">{title}</h3>
        </div>
      )}
      <CardContent className="p-0 relative">
        <div className={cn("relative aspect-video bg-gray-100 dark:bg-gray-800", isLoading ? "flex items-center justify-center" : "")}>
          {isLoading && (
            <div className="flex flex-col items-center justify-center">
              <Film className="h-12 w-12 text-gray-400 animate-pulse" />
              <p className="text-sm text-gray-500 mt-2">Loading video...</p>
            </div>
          )}
          
          {hasError && (
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-sm text-red-500 mt-2">Failed to load video</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs text-center">
                The video might not be properly stored or accessible.
              </p>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={videoUrl}
            className={cn("w-full h-full object-contain", isLoading || hasError ? "opacity-0" : "opacity-100")}
            controls
            autoPlay
            playsInline
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            muted={isMuted}
            onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
          />
          
          {!hasError && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center">
              <button
                onClick={handlePlay}
                className="p-1 rounded-full hover:bg-white/20 transition-colors mr-2"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white" />
                )}
              </button>
              <button
                onClick={handleMute}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
