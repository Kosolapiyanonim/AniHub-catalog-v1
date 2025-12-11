'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2, FastForward, Rewind, FullscreenIcon as FullscreenExit, Fullscreen } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PlayerClientProps {
  src: string;
}

export function PlayerClient({ src }: PlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [qualityLevels, setQualityLevels] = useState<number[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100;
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleProgressChange = useCallback((value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);

  const handlePlaybackRateChange = useCallback((value: string) => {
    const rate = parseFloat(value);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  const handleQualityChange = useCallback((value: string) => {
    setCurrentQuality(value);
    if (hlsRef.current) {
      if (value === 'auto') {
        hlsRef.current.currentLevel = -1; // Auto quality
      } else {
        const level = hlsRef.current.levels.findIndex(l => l.height === parseInt(value));
        if (level !== -1) {
          hlsRef.current.currentLevel = level;
        }
      }
    }
  }, []);

  const seek = useCallback((offset: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + offset));
    }
  }, [duration]);

  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    hideControls();
  }, [hideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play();
        setIsPlaying(true);
        setDuration(video.duration);
        const levels = hls.levels.map(l => l.height).sort((a, b) => b - a);
        setQualityLevels(['auto', ...levels]);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error encountered, trying to recover', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error encountered, trying to recover', data);
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play();
        setIsPlaying(true);
        setDuration(video.duration);
      });
    } else {
      console.error('HLS is not supported in this browser.');
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleEnded = () => setIsPlaying(false);
    const handlePlaying = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('loadeddata', handleLoadedData);

    // Initial volume and mute state
    video.volume = volume;
    video.muted = isMuted;

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('loadeddata', handleLoadedData);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src, volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      hideControls();
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
    }
  }, [isPlaying, hideControls]);

  return (
    <div
      className="relative w-full bg-black aspect-video overflow-hidden group cursor-none"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={hideControls}
      onClick={togglePlayPause}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={(e) => e.stopPropagation()} // Prevent play/pause when clicking video itself
        onDoubleClick={toggleFullScreen}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}

      <div className={cn(
        "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 z-30",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
      )}>
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleProgressChange}
          className="w-full mb-2 cursor-pointer"
        />
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); seek(-10); }}>
              <Rewind className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); seek(10); }}>
              <FastForward className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
              {isMuted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                  <Settings className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 bg-slate-800 text-white border-slate-700">
                <div className="grid gap-2">
                  <Label htmlFor="playback-rate" className="text-sm">Скорость воспроизведения</Label>
                  <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Скорость" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <SelectItem key={rate} value={rate.toString()}>{rate}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {qualityLevels.length > 0 && (
                    <>
                      <Label htmlFor="quality" className="text-sm mt-2">Качество</Label>
                      <Select value={currentQuality} onValueChange={handleQualityChange}>
                        <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Качество" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {qualityLevels.map(level => (
                            <SelectItem key={level} value={level.toString()}>
                              {level === -1 ? 'Авто' : `${level}p`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}>
              {isFullScreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
