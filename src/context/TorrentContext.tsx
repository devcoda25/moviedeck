'use client';

import type { Movie, Torrent, Download, DownloadStatus } from '@/lib/types';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  isClientReady: boolean;
}

export const TorrentContext = createContext<TorrentContextType | undefined>(undefined);

// Helper function to simulate async delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const TorrentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDownloads, setActiveDownloads] = useState<Download[]>([]);
  const [completedDownloads, setCompletedDownloads] = useState<Movie[]>([]);
  const { toast } = useToast();
  // The client is always "ready" in this simulated environment
  const isClientReady = true;

  // Load completed downloads from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('completedDownloads');
      if (storedCompleted) {
        const parsed = JSON.parse(storedCompleted);
        if (Array.isArray(parsed)) {
          setCompletedDownloads(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load completed downloads from localStorage:', error);
    }
  }, []);

  // Save completed downloads to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('completedDownloads', JSON.stringify(completedDownloads));
    } catch (error) {
      console.error('Failed to save completed downloads to localStorage:', error);
    }
  }, [completedDownloads]);

  const updateDownloadState = useCallback((movieId: number, updates: Partial<Download>) => {
    setActiveDownloads(prev => prev.map(d => (d.id === movieId ? { ...d, ...updates } : d)));
  }, []);

  const startDownload = useCallback(
    async (movie: Movie, torrent: Torrent) => {
      if (activeDownloads.some(d => d.id === movie.id) || completedDownloads.some(c => c.id === movie.id)) {
        toast({
          title: 'Already in Downloads',
          description: `${movie.title} is already in your downloads list.`,
        });
        return;
      }

      const initialDownloadState: Download = {
        ...movie,
        progress: 0,
        speed: 0, // Will be simulated
        peers: 0, // Will be simulated
        timeRemaining: Infinity,
        status: 'connecting',
        torrentInfo: torrent,
        downloaded: 0,
      };
      setActiveDownloads(prev => [...prev, initialDownloadState]);
      toast({ title: 'Download Started', description: `Preparing to download ${movie.title}.` });

      // --- Simulation Logic ---
      try {
        // 1. Connecting phase
        await sleep(1500);
        updateDownloadState(movie.id, { status: 'downloading', peers: Math.floor(Math.random() * 50) + 10 });
        
        // 2. Downloading phase
        let progress = 0;
        while (progress < 100) {
          await sleep(200); // Update every 200ms
          progress += Math.random() * 5;
          if (progress > 100) progress = 100;
          
          const speed = Math.random() * 5 * 1024 * 1024; // Simulate 0-5 MB/s
          const timeRemaining = progress > 0 ? ((100 - progress) / (speed / (torrent.size_bytes / 100))) : Infinity;

          updateDownloadState(movie.id, {
            progress,
            speed: speed,
            peers: Math.floor(Math.random() * 50) + 10,
            timeRemaining: timeRemaining,
            downloaded: (progress / 100) * torrent.size_bytes,
          });
        }

        // 3. Zipping phase
        updateDownloadState(movie.id, { status: 'zipping', speed: 0 });
        await sleep(2000); // Simulate zipping time

        // 4. Seeding phase (looks like "Completed" to the user)
        updateDownloadState(movie.id, { status: 'completed', progress: 100 });
        toast({ title: 'Download Complete!', description: `${movie.title} is ready.` });
        
        // 5. Simulate downloading the final zip file by downloading the .torrent file
        const magnetURI = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}`;
        const blob = new Blob([magnetURI], { type: 'application/x-bittorrent' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${movie.title.replace(/ /g, '_')}.torrent`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 6. Move to completed
        setActiveDownloads(prev => prev.filter(d => d.id !== movie.id));
        setCompletedDownloads(prev => {
          if (!prev.some(c => c.id === movie.id)) {
            return [movie, ...prev];
          }
          return prev;
        });

      } catch (error) {
        console.error(`Simulation error for ${movie.title}:`, error);
        updateDownloadState(movie.id, { status: 'error', speed: 0 });
        toast({
          title: 'Download Error',
          description: `Could not download ${movie.title}.`,
          variant: 'destructive',
        });
      }
    },
    [activeDownloads, completedDownloads, toast, updateDownloadState]
  );
  
  const cancelDownload = useCallback((movieId: number) => {
    // In a real scenario, this would have complex logic. Here, we just remove it.
    // We can add a "cancelling" state for visual polish if needed.
    const download = activeDownloads.find(d => d.id === movieId);
    if(download) {
      setActiveDownloads(prev => prev.filter(d => d.id !== movieId));
      toast({ title: 'Download Cancelled', description: `${download.title} has been removed.`, variant: 'destructive' });
    }
  }, [activeDownloads, toast]);

  const deleteCompletedDownload = useCallback((movieId: number) => {
    const movie = completedDownloads.find(c => c.id === movieId);
    if(movie) {
      setCompletedDownloads(prev => prev.filter(c => c.id !== movieId));
      toast({ title: 'Download Removed', description: `${movie.title} has been removed from your list.` });
    }
  }, [completedDownloads, toast]);

  const isDownloading = useCallback((movieId: number) => activeDownloads.some(d => d.id === movieId), [activeDownloads]);
  const getDownload = useCallback((movieId: number) => activeDownloads.find(d => d.id === movieId), [activeDownloads]);

  const value = {
    activeDownloads,
    completedDownloads,
    startDownload,
    // Pause and Resume are complex and not easily simulated. We'll make them no-ops.
    pauseDownload: (id: number) => toast({title: "Pause is not available in this simulation."}),
    resumeDownload: (id: number) => toast({title: "Resume is not available in this simulation."}),
    cancelDownload,
    deleteCompletedDownload,
    isDownloading,
    getDownload,
    isClientReady,
  };

  return <TorrentContext.Provider value={value}>{children}</TorrentContext.Provider>;
};
