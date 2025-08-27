'use client';

import type { Movie, Torrent, Download } from '@/lib/types';
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface TorrentContextType {
  activeDownloads: Download[];
  completedDownloads: Movie[];
  startDownload: (movie: Movie, torrent: Torrent) => void;
  pauseDownload: (movieId: number) => void;
  resumeDownload: (movieId: number) => void;
  cancelDownload: (movieId: number) => void;
  deleteCompletedDownload: (movieId: number) => void;
  isDownloading: (movieId: number) => boolean;
  getDownload: (movieId: number) => Download | undefined;
}

export const TorrentContext = createContext<TorrentContextType | undefined>(undefined);

// Helper to trigger a file download in the browser
function downloadFile(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
}

export const TorrentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDownloads, setActiveDownloads] = useState<Download[]>([]);
  const [completedDownloads, setCompletedDownloads] = useState<Movie[]>([]);
  const intervals = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const errorCounter = useRef<Map<number, number>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('completedDownloads');
      if (storedCompleted) {
        setCompletedDownloads(JSON.parse(storedCompleted));
      }
    } catch (error) {
      console.error("Failed to load completed from localStorage", error);
    }
  }, []);

  const clearDownloadInterval = useCallback((movieId: number) => {
    if (intervals.current.has(movieId)) {
      clearInterval(intervals.current.get(movieId)!);
      intervals.current.delete(movieId);
    }
  }, []);

  const updateDownloadState = useCallback((movieId: number, updates: Partial<Download>) => {
    setActiveDownloads(prev => prev.map(d => d.id === movieId ? { ...d, ...updates } : d));
  }, []);
  
  const startDownload = useCallback((movie: Movie, torrent: Torrent) => {
    if (activeDownloads.some(d => d.id === movie.id) || completedDownloads.some(c => c.id === movie.id)) {
      toast({ title: "Already Downloaded", description: `${movie.title} is already in your downloads.` });
      return;
    }

    toast({ title: "Download Started", description: `Starting download for ${movie.title}.`, variant: "default" });

    const newDownload: Download = {
      ...movie,
      progress: 0,
      speed: 0,
      peers: Math.floor(Math.random() * torrent.peers),
      timeRemaining: Infinity,
      status: 'downloading',
      torrentInfo: torrent,
    };
    setActiveDownloads(prev => [...prev, newDownload]);
    errorCounter.current.set(movie.id, 0); // Reset error counter

    const intervalId = setInterval(() => {
        setActiveDownloads(prev => {
            const download = prev.find(d => d.id === movie.id);
            if (!download) {
                clearDownloadInterval(movie.id);
                return prev;
            }

            // Consistent error simulation: fail on the 3rd tick
            const currentErrorCount = errorCounter.current.get(movie.id) || 0;
            if (currentErrorCount >= 2) { 
                errorCounter.current.delete(movie.id);
                clearDownloadInterval(movie.id);
                toast({ title: "Download Error", description: `An error occurred while downloading ${movie.title}.`, variant: 'destructive' });
                return prev.map(d => d.id === movie.id ? { ...d, status: 'error', speed: 0 } : d);
            }
            errorCounter.current.set(movie.id, currentErrorCount + 1);

            let newProgress = download.progress;
            let newStatus = download.status;

            if (download.status === 'downloading') {
                newProgress += 34; // Speed up progress
                if (newProgress >= 100) {
                    newProgress = 100;
                    newStatus = 'zipping';
                }
            } else if (download.status === 'zipping') {
                newStatus = 'seeding';
            } else if (download.status === 'seeding') {
                clearDownloadInterval(movie.id);
                setCompletedDownloads(prevCompleted => [movie, ...prevCompleted]);
                toast({ title: "Download Complete", description: `${movie.title} has finished downloading.` });
                
                // Trigger file download
                downloadFile(`${movie.title.replace(/ /g, '_')}.txt`, `This is a placeholder for the downloaded movie: ${movie.title_long}`);

                return prev.filter(d => d.id !== movie.id);
            }
            
            const speed = (2000 + Math.random() * 8000);
            const remainingProgress = 100 - download.progress;
            const timeRemaining = remainingProgress / (speed / (torrent.size_bytes / 100000) || 1) ;

            return prev.map(d => d.id === movie.id ? { ...d, progress: newProgress, status: newStatus, speed, timeRemaining, peers: Math.floor(Math.random() * torrent.peers) } : d);
        });
    }, 800); // Slower interval for more realistic step-by-step progress

    intervals.current.set(movie.id, intervalId);
  }, [activeDownloads, completedDownloads, toast, updateDownloadState, clearDownloadInterval]);

  const pauseDownload = (movieId: number) => {
    updateDownloadState(movieId, { status: 'paused', speed: 0 });
    clearDownloadInterval(movieId);
  };

  const resumeDownload = (movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    if (download) {
      updateDownloadState(movieId, { status: 'downloading' });
      const { torrentInfo, ...movie } = download;
      startDownload(movie as Movie, torrentInfo);
    }
  };
  
  const cancelDownload = (movieId: number) => {
    clearDownloadInterval(movieId);
    setActiveDownloads(prev => prev.filter(d => d.id !== movieId));
    toast({ title: "Download Cancelled", variant: 'destructive' });
  };

  const deleteCompletedDownload = (movieId: number) => {
    setCompletedDownloads(prev => prev.filter(c => c.id !== movieId));
    toast({ title: "Download Removed" });
  };

  useEffect(() => {
    localStorage.setItem('completedDownloads', JSON.stringify(completedDownloads));
  }, [completedDownloads]);
  
  useEffect(() => {
    return () => {
      intervals.current.forEach(id => clearInterval(id));
    };
  }, []);

  const isDownloading = (movieId: number) => activeDownloads.some(d => d.id === movieId) || completedDownloads.some(c => c.id === movieId);
  const getDownload = (movieId: number) => activeDownloads.find(d => d.id === movieId);
  
  const value = { activeDownloads, completedDownloads, startDownload, pauseDownload, resumeDownload, cancelDownload, deleteCompletedDownload, isDownloading, getDownload };

  return <TorrentContext.Provider value={value}>{children}</TorrentContext.Provider>;
};
