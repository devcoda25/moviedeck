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
    // Prevent re-downloading if already active or completed
    if (activeDownloads.some(d => d.id === movie.id) || completedDownloads.some(c => c.id === movie.id)) {
      // Check if it's a retry from an error state
      const existingDownload = activeDownloads.find(d => d.id === movie.id);
      if (!existingDownload || existingDownload.status !== 'error') {
        toast({ title: "Already Downloaded", description: `${movie.title} is already in your downloads.` });
        return;
      }
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
  
    setActiveDownloads(prev => {
        // If it's a retry, update the existing entry, otherwise add it.
        const existingIndex = prev.findIndex(d => d.id === movie.id);
        if (existingIndex > -1) {
            return prev.map((d, i) => i === existingIndex ? newDownload : d);
        }
        return [...prev, newDownload];
    });

    const intervalId = setInterval(() => {
        setActiveDownloads(prev => {
            const download = prev.find(d => d.id === movie.id);
            if (!download || download.status === 'paused' || download.status === 'error') {
                clearDownloadInterval(movie.id);
                return prev;
            }

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
    }, 800); 

    intervals.current.set(movie.id, intervalId);
  }, [activeDownloads, completedDownloads, toast, clearDownloadInterval]);

  const pauseDownload = (movieId: number) => {
    clearDownloadInterval(movieId);
    updateDownloadState(movieId, { status: 'paused', speed: 0 });
  };

  const resumeDownload = (movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    if (download) {
        clearDownloadInterval(movieId); // Ensure no duplicate intervals
        // We set it to downloading and startDownload will pick it up
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
