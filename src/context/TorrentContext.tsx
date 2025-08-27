'use client';

import type { Movie, Torrent, Download } from '@/lib/types';
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

// Forward-declare the WebTorrent type to avoid importing it at the top level
declare global {
  namespace WebTorrent {
    interface Instance {}
    interface Torrent {}
  }
}

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
  const clientRef = useRef<WebTorrent.Instance | null>(null);
  const { toast } = useToast();
  const WebTorrentRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !clientRef.current) {
        import('webtorrent').then(wt => {
            WebTorrentRef.current = wt.default;
            if (!clientRef.current) {
                clientRef.current = new WebTorrentRef.current();
            }
        });
    }

    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []);

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

  useEffect(() => {
    localStorage.setItem('completedDownloads', JSON.stringify(completedDownloads));
  }, [completedDownloads]);

  const updateDownloadState = useCallback((movieId: number, updates: Partial<Download>) => {
    setActiveDownloads(prev => 
        prev.map(d => d.id === movieId ? { ...d, ...updates } : d)
    );
  }, []);

  const startDownload = useCallback((movie: Movie, torrent: Torrent) => {
    if (!clientRef.current || !WebTorrentRef.current) {
        toast({ title: "Torrent client not ready", description: "Please wait a moment and try again.", variant: "destructive" });
        return;
    }
    if (activeDownloads.some(d => d.id === movie.id) || completedDownloads.some(c => c.id === movie.id)) {
        toast({ title: "Already in Downloads", description: `${movie.title} is already in your downloads list.` });
        return;
    }
    
    const initialDownloadState: Download = {
        ...movie,
        progress: 0,
        speed: 0,
        peers: 0,
        timeRemaining: Infinity,
        status: 'connecting',
        torrentInfo: torrent,
        downloaded: 0
    };
    setActiveDownloads(prev => [...prev, initialDownloadState]);

    const magnetURI = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce`;

    clientRef.current.add(magnetURI, (wtTorrent: any) => {
        updateDownloadState(movie.id, { status: 'downloading', peers: wtTorrent.numPeers });

        wtTorrent.on('download', () => {
            updateDownloadState(movie.id, {
                progress: wtTorrent.progress * 100,
                speed: wtTorrent.downloadSpeed,
                downloaded: wtTorrent.downloaded,
                peers: wtTorrent.numPeers,
                timeRemaining: wtTorrent.timeRemaining,
            });
        });

        wtTorrent.on('done', () => {
            updateDownloadState(movie.id, { status: 'seeding', progress: 100, speed: 0 });
            toast({ title: "Download Complete!", description: `${movie.title} is now seeding.`});
            
            setTimeout(() => {
                 wtTorrent.files[0].getBlobURL((err: Error, url: string | undefined) => {
                    if (err || !url) {
                        toast({ title: "Error creating download link", variant: 'destructive' });
                         setActiveDownloads(prev => prev.filter(d => d.id !== movie.id));
                        return;
                    }
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${movie.title.replace(/ /g, '_')}.mp4`; 
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    setActiveDownloads(prev => prev.filter(d => d.id !== movie.id));
                    setCompletedDownloads(prev => [movie, ...prev.filter(m => m.id !== movie.id)]);
                });
            }, 500); 
        });

        wtTorrent.on('error', (err: Error) => {
            console.error(`Torrent error for ${movie.title}:`, err);
            updateDownloadState(movie.id, { status: 'error', speed: 0 });
            toast({ title: "Download Error", description: `Could not download ${movie.title}.`, variant: "destructive" });
        });
    });
  }, [activeDownloads, completedDownloads, toast, updateDownloadState]);
  
  const cancelDownload = useCallback((movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    if (download && clientRef.current) {
        const torrentInstance = clientRef.current.get(download.torrentInfo.hash);
        if (torrentInstance) {
            torrentInstance.destroy();
        }
    }
    setActiveDownloads(prev => prev.filter(d => d.id !== movieId));
    toast({ title: "Download Cancelled", variant: 'destructive' });
  }, [activeDownloads, toast]);

  const pauseDownload = (movieId: number) => {
    toast({ title: "Pause Not Implemented", description: "This feature is not yet available." });
  };

  const resumeDownload = (movieId: number) => {
    toast({ title: "Resume Not Implemented", description: "This feature is not yet available." });
  };

  const deleteCompletedDownload = (movieId: number) => {
    setCompletedDownloads(prev => prev.filter(c => c.id !== movieId));
    toast({ title: "Download Removed" });
  };

  const isDownloading = (movieId: number) => activeDownloads.some(d => d.id === movieId);
  const getDownload = (movieId: number) => activeDownloads.find(d => d.id === movieId);
  
  const value = { activeDownloads, completedDownloads, startDownload, pauseDownload, resumeDownload, cancelDownload, deleteCompletedDownload, isDownloading, getDownload };

  return <TorrentContext.Provider value={value}>{children}</TorrentContext.Provider>;
};
