'use client';

import type { Movie, Torrent, Download, DownloadStatus } from '@/lib/types';
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for WebTorrent inside the module to keep them separate
interface WebTorrentInstance {
    add: (magnetURI: string, callback: (torrent: WebTorrentTorrent) => void) => void;
    get: (hash: string) => WebTorrentTorrent | undefined;
    destroy: (callback?: (err: Error | string) => void) => void;
}
  
interface WebTorrentTorrent {
    progress: number;
    downloadSpeed: number;
    uploadSpeed: number;
    downloaded: number;
    numPeers: number;
    timeRemaining: number;
    files: { name: string; getBlobURL: (cb: (err: Error | null, url: string | null) => void) => void }[];
    pause: () => void;
    resume: () => void;
    destroy: () => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback: (...args: any[]) => void) => void;
    infoHash: string;
}

declare global {
  interface Window {
    os: { tmpdir: () => string };
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
  isClientReady: boolean;
}

export const TorrentContext = createContext<TorrentContextType | undefined>(undefined);

export const TorrentProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDownloads, setActiveDownloads] = useState<Download[]>([]);
  const [completedDownloads, setCompletedDownloads] = useState<Movie[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);
  const clientRef = useRef<WebTorrentInstance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client
    if (typeof window !== 'undefined' && !clientRef.current) {
      // Polyfill for environments where 'os' might be expected but is not available.
      if (!window.os) {
        window.os = { tmpdir: () => '/tmp' };
      }

      import('webtorrent')
        .then(WebTorrentModule => {
          if (!clientRef.current) {
            const WebTorrent = WebTorrentModule.default;
            clientRef.current = new WebTorrent() as WebTorrentInstance;
            setIsClientReady(true);
          }
        })
        .catch(err => {
          console.error('Failed to load WebTorrent:', err);
          toast({
            title: 'Error',
            description: 'Failed to initialize torrent client.',
            variant: 'destructive'
          });
        });
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
        setIsClientReady(false);
      }
    };
  }, [toast]);

  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('completedDownloads');
      if (storedCompleted) {
        const parsed = JSON.parse(storedCompleted);
        if (Array.isArray(parsed)) {
          setCompletedDownloads(parsed);
        } else {
          console.warn('Invalid completedDownloads data in localStorage');
        }
      }
    } catch (error) {
      console.error('Failed to load completed downloads from localStorage:', error);
    }
  }, []);

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
    (movie: Movie, torrent: Torrent) => {
      if (!isClientReady || !clientRef.current) {
        toast({
          title: 'Torrent client not ready',
          description: 'Please wait a moment and try again.',
          variant: 'destructive'
        });
        return;
      }
      if (activeDownloads.some(d => d.id === movie.id) || completedDownloads.some(c => c.id === movie.id)) {
        toast({
          title: 'Already in Downloads',
          description: `${movie.title} is already in your downloads list.`
        });
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

      const magnetURI = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(
        movie.title
      )}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce`;

      clientRef.current.add(magnetURI, (wtTorrent: WebTorrentTorrent) => {
        updateDownloadState(movie.id, { status: 'downloading', peers: wtTorrent.numPeers });

        const onDownload = () => {
          updateDownloadState(movie.id, {
            progress: wtTorrent.progress * 100,
            speed: wtTorrent.downloadSpeed,
            downloaded: wtTorrent.downloaded,
            peers: wtTorrent.numPeers,
            timeRemaining: wtTorrent.timeRemaining
          });
        };

        const onDone = () => {
          updateDownloadState(movie.id, { status: 'seeding', progress: 100, speed: 0 });
          toast({ title: 'Download Complete!', description: `${movie.title} is now seeding.` });

          if (!wtTorrent.files || wtTorrent.files.length === 0) {
            toast({ title: 'Error', description: 'No files found in the torrent.', variant: 'destructive' });
            return;
          }
          
          // Auto-download the first file
          wtTorrent.files[0].getBlobURL((err, url) => {
            if (err || !url) {
                toast({ title: 'Error creating download link', description: err?.message || 'Unknown error', variant: 'destructive' });
                return;
            }
            const a = document.createElement('a');
            a.href = url;
            a.download = wtTorrent.files[0].name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
          
          setActiveDownloads(prev => prev.filter(d => d.id !== movie.id));
          setCompletedDownloads(prev => {
            if (!prev.some(c => c.id === movie.id)) {
              return [movie, ...prev];
            }
            return prev;
          });
        };

        const onError = (err: Error) => {
          console.error(`Torrent error for ${movie.title}:`, err);
          updateDownloadState(movie.id, { status: 'error', speed: 0 });
          toast({
            title: 'Download Error',
            description: `Could not download ${movie.title}.`,
            variant: 'destructive'
          });
        };

        wtTorrent.on('download', onDownload);
        wtTorrent.on('done', onDone);
        wtTorrent.on('error', onError);
      });
    },
    [activeDownloads, completedDownloads, toast, updateDownloadState, isClientReady]
  );

  const pauseDownload = useCallback((movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    const torrentInstance = download ? clientRef.current?.get(download.torrentInfo.hash) : undefined;
    if (torrentInstance) {
      torrentInstance.pause();
      updateDownloadState(movieId, { status: 'paused', speed: 0 });
      toast({ title: 'Download Paused', description: `${download?.title} has been paused.` });
    }
  }, [activeDownloads, toast, updateDownloadState]);

  const resumeDownload = useCallback((movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    const torrentInstance = download ? clientRef.current?.get(download.torrentInfo.hash) : undefined;
    if (torrentInstance) {
      torrentInstance.resume();
      updateDownloadState(movieId, { status: 'downloading' });
      toast({ title: 'Download Resumed', description: `${download?.title} is resuming.` });
    }
  }, [activeDownloads, toast, updateDownloadState]);

  const cancelDownload = useCallback((movieId: number) => {
    const download = activeDownloads.find(d => d.id === movieId);
    if (download) {
      const torrentInstance = clientRef.current?.get(download.torrentInfo.hash);
      if (torrentInstance) {
        torrentInstance.destroy();
      }
      setActiveDownloads(prev => prev.filter(d => d.id !== movieId));
      toast({ title: 'Download Cancelled', description: `${download.title} has been cancelled.`, variant: 'destructive' });
    }
  }, [activeDownloads, toast]);

  const deleteCompletedDownload = useCallback((movieId: number) => {
    const download = completedDownloads.find(c => c.id === movieId);
    setCompletedDownloads(prev => prev.filter(c => c.id !== movieId));
    toast({ title: 'Download Removed', description: `${download?.title || 'Download'} has been removed from completed list.` });
  }, [completedDownloads, toast]);

  const isDownloading = useCallback((movieId: number) => activeDownloads.some(d => d.id === movieId), [activeDownloads]);
  const getDownload = useCallback((movieId: number) => activeDownloads.find(d => d.id === movieId), [activeDownloads]);

  const value = {
    activeDownloads,
    completedDownloads,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteCompletedDownload,
    isDownloading,
    getDownload,
    isClientReady
  };

  return <TorrentContext.Provider value={value}>{children}</TorrentContext.Provider>;
};
