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
      clearInterval(intervals.current.get(movieId));
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

    const intervalId = setInterval(() => {
      const download = activeDownloads.find(d => d.id === movie.id);
      if(!download || download.status !== 'downloading') return;

      // Simulate a chance of error
      if (Math.random() < 0.05) { // 5% chance of error
        updateDownloadState(movie.id, { status: 'error', speed: 0 });
        clearDownloadInterval(movie.id);
        toast({ title: "Download Error", description: `An error occurred while downloading ${movie.title}.`, variant: 'destructive' });
        return;
      }
      
      const newProgress = download.progress + 10 + Math.random() * 15; // Faster progress
      const speed = (2000 + Math.random() * 8000) * (newProgress / 100);
      const remainingProgress = 100 - newProgress > 0 ? 100 - newProgress : 0;
      const timeRemaining = remainingProgress / (speed / (torrent.size_bytes / 100000) || 1) ;

      
      if (newProgress >= 100) {
        updateDownloadState(movie.id, { progress: 100, speed: 0, status: 'completed', timeRemaining: 0 });
        clearDownloadInterval(movie.id);
        setActiveDownloads(prev => prev.filter(d => d.id !== movie.id));
        setCompletedDownloads(prev => [movie, ...prev]);
        toast({ title: "Download Complete", description: `${movie.title} has finished downloading.` });
      } else {
        updateDownloadState(movie.id, { progress: newProgress, speed, timeRemaining, peers: Math.floor(Math.random() * torrent.peers) });
      }
    }, 500);

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
      // We need to re-initiate the "download" process for it.
      const newDownload: Download = {
        ...download,
        status: 'downloading',
      };

      // Remove the old one before starting a new interval
      setActiveDownloads(prev => prev.filter(d => d.id !== movieId));
      
      // Use a timeout to ensure state updates before re-adding
      setTimeout(() => {
        startDownload(newDownload, newDownload.torrentInfo);
      }, 100)

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
  
  // Cleanup on unmount
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
