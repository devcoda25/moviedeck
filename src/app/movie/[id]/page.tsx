'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieById } from '@/lib/data';
import type { Movie, CastMember, Torrent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Star, Download, Film, Users, Wand2, CheckCircle, ExternalLink } from 'lucide-react';
import MovieList from '@/components/MovieList';
import { useTorrent } from '@/hooks/useTorrent';
import { enhanceMovieDescription } from '@/ai/flows/enhance-movie-description';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function MovieDetailPageContent() {
  const params = useParams();
  const id = Number(params.id);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enhancedDescription, setEnhancedDescription] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { startDownload, isDownloading, getDownload, isClientReady } = useTorrent();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      getMovieById(id).then((data) => {
        if(data) {
            setMovie(data);
        }
        setIsLoading(false);
      });
    }
  }, [id]);

  const handleEnhanceDescription = async () => {
    if (!movie) return;
    setIsEnhancing(true);
    try {
      const result = await enhanceMovieDescription({
        movieTitle: movie.title,
        originalDescription: movie.description_full,
      });
      setEnhancedDescription(result.enhancedDescription);
      toast({ title: 'Description Enhanced!', description: 'The movie description has been updated with AI.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to enhance description.', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  if (isLoading) {
    return <MovieDetailSkeleton />;
  }

  if (!movie) {
    return <div className="container mx-auto py-12 text-center">Movie not found.</div>;
  }

  const downloadStatus = getDownload(movie.id);

  return (
    <>
      <div className="relative h-[40vh] min-h-[300px] w-full md:h-[60vh]">
        <Image
          src={movie.background_image_original}
          alt={`Backdrop for ${movie.title}`}
          fill
          priority
          data-ai-hint="movie background"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto -mt-24 px-4 pb-12 lg:-mt-48 lg:px-8">
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-end">
          <div className="relative h-64 w-48 flex-shrink-0 overflow-hidden rounded-lg shadow-2xl md:h-80 md:w-56">
            <Image
              src={movie.large_cover_image}
              alt={`Poster for ${movie.title}`}
              fill
              className="object-cover"
              data-ai-hint="movie poster"
            />
          </div>
          <div className="flex-grow space-y-2 text-center text-white md:text-left">
            <h1 className="text-3xl font-bold tracking-tighter md:text-5xl font-headline">{movie.title_long}</h1>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground md:justify-start">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" /> {movie.rating} / 10</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> {movie.runtime} min</span>
              <span>{movie.mpa_rating}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2 md:justify-start">
              {movie.genres.map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold font-headline">Synopsis</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground">
                <p>{enhancedDescription || movie.description_full}</p>
              </div>
              <Button onClick={handleEnhanceDescription} disabled={isEnhancing} variant="outline" size="sm" className="mt-4">
                <Wand2 className="mr-2 h-4 w-4" />
                {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
              </Button>
            </div>
            
            {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold font-headline"><Users className="mr-2 inline-block h-6 w-6"/>Cast</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {movie.cast.map(member => (
                          <div key={member.name} className="flex items-center gap-3">
                              <Avatar>
                                  <AvatarImage src={member.url_small_image} alt={member.name} data-ai-hint="person photo"/>
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="font-semibold">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.character_name}</p>
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <h2 className="text-2xl font-bold font-headline"><Download className="mr-2 inline-block h-6 w-6"/> Torrents</h2>
                    {downloadStatus && (
                        <div className="p-4 rounded-md bg-green-900/50 text-green-300 border border-green-700">
                          <p className="font-bold">Status: {downloadStatus.status}</p>
                          <p>Progress: {downloadStatus.progress.toFixed(1)}%</p>
                        </div>
                    )}
                    {movie.torrents.map(torrent => (
                        <div key={torrent.hash} className="flex items-center justify-between gap-2 rounded-lg bg-card-foreground/5 p-3">
                            <div>
                                <p className="font-bold">{torrent.quality} <span className="font-normal text-muted-foreground">{torrent.type}</span></p>
                                <p className="text-sm text-muted-foreground">{torrent.size} | Seeds: {torrent.seeds} / Peers: {torrent.peers}</p>
                            </div>
                            <Button onClick={() => startDownload(movie, torrent)} disabled={isDownloading(movie.id) || !isClientReady} title={!isClientReady ? "Torrent client is loading..." : ""}>
                              {isDownloading(movie.id) ? <CheckCircle className="mr-2 h-4 w-4"/> : <Download className="mr-2 h-4 w-4"/>}
                                {isDownloading(movie.id) ? 'Added' : 'Download'}
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" asChild className="w-full">
                        <a href={`https://www.youtube.com/watch?v=${movie.yt_trailer_code}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4"/> Watch Trailer
                        </a>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>

        {movie.suggestions && movie.suggestions.length > 0 && (
          <div className="mt-16">
            <MovieList title="Related Movies" movies={movie.suggestions} />
          </div>
        )}
      </div>
    </>
  );
}

function MovieDetailSkeleton() {
  return (
    <>
      <Skeleton className="h-[40vh] min-h-[300px] w-full md:h-[60vh]" />
      <div className="container mx-auto -mt-24 px-4 pb-12 lg:-mt-48 lg:px-8">
        <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:items-end">
          <Skeleton className="relative h-64 w-48 flex-shrink-0 rounded-lg shadow-2xl md:h-80 md:w-56" />
          <div className="w-full flex-grow space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function MovieDetailPage() {
    return (
        <Suspense fallback={<MovieDetailSkeleton />}>
            <MovieDetailPageContent />
        </Suspense>
    )
}
