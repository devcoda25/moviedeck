'use client';

import { TorrentContext } from '@/context/TorrentContext';
import { useContext } from 'react';

export const useTorrent = () => {
  const context = useContext(TorrentContext);
  if (context === undefined) {
    throw new Error('useTorrent must be used within a TorrentProvider');
  }
  return context;
};
