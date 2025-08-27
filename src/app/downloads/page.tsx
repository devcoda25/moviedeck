'use client';

import { useTorrent } from '@/hooks/useTorrent';
import DownloadCard from '@/components/DownloadCard';
import { DownloadCloud, CheckCircle } from 'lucide-react';

export default function DownloadsPage() {
  const { activeDownloads, completedDownloads, pauseDownload, resumeDownload, cancelDownload, deleteCompletedDownload } = useTorrent();

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight font-headline">Downloads</h1>

      <section className="space-y-6">
        <h2 className="flex items-center gap-3 text-2xl font-bold font-headline">
          <DownloadCloud className="h-7 w-7 text-primary" />
          Active Downloads ({activeDownloads.length})
        </h2>
        {activeDownloads.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeDownloads.map((download) => (
              <DownloadCard
                key={download.id}
                download={download}
                onPause={() => pauseDownload(download.id)}
                onResume={() => resumeDownload(download.id)}
                onCancel={() => cancelDownload(download.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No active downloads.</p>
        )}
      </section>

      <section className="mt-12 space-y-6">
        <h2 className="flex items-center gap-3 text-2xl font-bold font-headline">
          <CheckCircle className="h-7 w-7 text-green-500" />
          Completed Downloads ({completedDownloads.length})
        </h2>
        {completedDownloads.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedDownloads.map((movie) => (
              <DownloadCard
                key={movie.id}
                download={{ ...movie, status: 'completed', progress: 100, torrentInfo: movie.torrents[0], speed: 0, peers: 0, timeRemaining: 0 }}
                onDelete={() => deleteCompletedDownload(movie.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No completed downloads yet.</p>
        )}
      </section>
    </div>
  );
}
