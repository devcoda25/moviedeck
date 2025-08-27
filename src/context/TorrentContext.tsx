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

// Helper to trigger a file download in the browser from a URL
async function downloadFileFromUrl(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch torrent file: ${response.statusText}`);
    }
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download failed:", error);
    // We need to inform the user about the failure.
    // This part will be handled by the component using this function.
    throw error;
  }
}

export const TorrentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDownloads, setActiveDownloads] = useState<Download[]>([]);
  const [completedDownloads, setCompletedDownloads] = useState<Movie[]>([]);
  const intervals = useRef<Map<number, NodeJS.Timeout>>(new Map());
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
      const existingDownload = activeDownloads.find(d => d.id === movie.id);
      if (!existingDownload || existingDownload.status !== 'error') {
        toast({ title: "Already in Downloads", description: `${movie.title} is already in your downloads list.` });
        return;
      }
    }
  
    toast({ title: "Download Started", description: `Preparing download for ${movie.title}.` });
  
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
                    newStatus = 'seeding';
                }
            } else if (download.status === 'seeding') {
                clearDownloadInterval(movie.id);
                setCompletedDownloads(prevCompleted => [movie, ...prevCompleted]);
                
                downloadFileFromUrl(torrent.url, `${movie.title.replace(/ /g, '_')}.torrent`)
                  .then(() => {
                    toast({ title: "Download Complete", description: `The .torrent file for ${movie.title} has been downloaded.` });
                  })
                  .catch(() => {
                    toast({ title: "Download Failed", description: `Could not download the .torrent file. Please try again.`, variant: 'destructive' });
                    // Optionally set the download to an error state
                    setActiveDownloads(currentDownloads => currentDownloads.filter(d => d.id !== movie.id));
                    // Or set to an error state to allow retry
                    // updateDownloadState(movie.id, { status: 'error' });
                  });

                return prev.filter(d => d.id !== movie.id);
            }
            
            const speed = (2000 + Math.random() * 8000);
            const remainingProgress = 100 - download.progress;
            const timeRemaining = remainingProgress > 0 ? remainingProgress / (speed / (torrent.size_bytes / 100000) || 1) : 0;

            return prev.map(d => d.id === movie.id ? { ...d, progress: newProgress, status: newStatus, speed, timeRemaining, peers: Math.floor(Math.random() * torrent.peers) } : d);
        });
    }, 800); 

    intervals.current.set(movie.id, intervalId);
  }, [activeDownloads, completedDownloads, toast, clearDownloadInterval, updateDownloadState]);

  const pauseDownload = (movieId: number) => {
    clearDownloadInterval(movieId);
    updateDownloadState(movieId, { status: 'paused', speed: 0 });
  };

  const resumeDownload = (movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    if (download) {
        clearDownloadInterval(movieId);
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
