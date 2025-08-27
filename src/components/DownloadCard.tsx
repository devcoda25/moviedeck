import type { Download } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Pause, Play, Trash2, X, DownloadCloud, ArrowDown, ArrowUp, Users, Clock, AlertTriangle, RotateCw, Archive, CheckCircle } from 'lucide-react';

interface DownloadCardProps {
  download: Download;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

function formatSpeed(speed: number) {
  if (speed < 1024) return `${speed.toFixed(1)} KB/s`;
  return `${(speed / 1024).toFixed(1)} MB/s`;
}

function formatTime(seconds: number) {
  if (seconds === Infinity || isNaN(seconds) || seconds < 0) return '∞';
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

const statusInfo: Record<Download['status'], { text: string, icon: React.ReactNode, color: string }> = {
    downloading: { text: 'Downloading...', icon: <ArrowDown className="h-4 w-4" />, color: 'text-blue-400' },
    zipping: { text: 'Zipping...', icon: <Archive className="h-4 w-4 animate-pulse" />, color: 'text-yellow-400' },
    seeding: { text: 'Seeding...', icon: <ArrowUp className="h-4 w-4" />, color: 'text-green-400' },
    completed: { text: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-400' },
    paused: { text: 'Paused', icon: <Pause className="h-4 w-4" />, color: 'text-gray-400' },
    error: { text: 'Error', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-destructive' },
};


export default function DownloadCard({ download, onPause, onResume, onCancel, onDelete }: DownloadCardProps) {
  const isCompleted = download.status === 'completed' || download.status === 'seeding';
  const isError = download.status === 'error';
  const currentStatusInfo = statusInfo[download.status] || statusInfo.downloading;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image src={download.small_cover_image} alt={download.title} fill className="object-cover" data-ai-hint="movie poster"/>
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg">
            <Link href={`/movie/${download.id}`} className="hover:text-primary transition-colors">
              {download.title}
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{download.year} &middot; {download.torrentInfo.quality}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 px-4 pb-4">
        {download.status === 'completed' ? (
           <div className="text-center text-green-400 flex items-center justify-center gap-2">
             <CheckCircle className="h-5 w-5" /> Download Complete
           </div>
        ) : isError ? (
            <div className="flex flex-col items-center justify-center text-center text-destructive">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="font-semibold">Download Failed</p>
            </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
                <div className={currentStatusInfo.color}>{currentStatusInfo.icon}</div>
                <span className={`font-semibold ${currentStatusInfo.color}`}>{currentStatusInfo.text}</span>
            </div>
            <Progress value={download.progress} />
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><ArrowDown className="h-3 w-3 text-primary" />{formatSpeed(download.speed)}</div>
              <div className="flex items-center gap-1"><Users className="h-3 w-3 text-primary" />{download.peers} peers</div>
              <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" />{formatTime(download.timeRemaining)} left</div>
              <div className="flex items-center gap-1">{download.progress.toFixed(1)}%</div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 p-2 bg-muted/50">
        {download.status === 'completed' ? (
          <>
            <Button variant="ghost" size="sm" asChild>
                <a href={`https://www.youtube.com/watch?v=${download.yt_trailer_code}`} target="_blank" rel="noopener noreferrer">
                    <Play className="mr-2 h-4 w-4" /> Trailer
                </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </>
        ) : isError ? (
            <>
                <Button variant="ghost" size="sm" onClick={onResume}>
                    <RotateCw className="mr-2 h-4 w-4" /> Retry
                </Button>
                <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
                    <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
            </>
        ) : (
          <>
            {download.status === 'downloading' || download.status === 'zipping' || download.status === 'seeding' ? (
              <Button variant="ghost" size="sm" onClick={onPause}>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onResume}>
                <Play className="mr-2 h-4 w-4" /> Resume
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-destructive hover:text-destructive">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
