import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getHighestRatedMovies, getMostDownloadedMovies, getLatestMovies } from '@/lib/data';
import MovieList from '@/components/MovieList';
import { PlayCircle, Star } from 'lucide-react';

export default async function Home() {
  const highestRated = await getHighestRatedMovies();
  const mostDownloaded = await getMostDownloadedMovies();
  const latestMovies = await getLatestMovies();
  const heroMovie = mostDownloaded[0];

  return (
    <div className="space-y-16 pb-16">
      {heroMovie && (
        <section className="relative -mt-24 h-[55vh] min-h-[400px] w-full md:h-[80vh]">
          <Image
            src={heroMovie.background_image_original}
            alt={`Backdrop for ${heroMovie.title}`}
            fill
            priority
            data-ai-hint="movie background"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center lg:justify-start">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-lg space-y-4 text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg lg:text-6xl font-headline">
                  {heroMovie.title_long}
                </h1>
                <div className="flex items-center justify-center gap-4 text-lg text-white/90 drop-shadow-md lg:justify-start">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-primary" />
                    <span>{heroMovie.rating} / 10</span>
                  </div>
                  <span>{heroMovie.runtime} min</span>
                  <span>{heroMovie.genres[0]}</span>
                </div>
                <p className="text-base text-white/80 drop-shadow-lg md:text-lg">
                  {heroMovie.synopsis.length > 200
                    ? `${heroMovie.synopsis.substring(0, 200)}...`
                    : heroMovie.synopsis}
                </p>
                <div className="flex justify-center gap-4 lg:justify-start">
                  <Button asChild size="lg" className="font-bold">
                    <Link href={`/movie/${heroMovie.id}`}>
                      <PlayCircle className="mr-2 h-6 w-6" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto space-y-12 px-4 lg:px-8">
        <MovieList title="Highest Rated" movies={highestRated} />
        <MovieList title="Most Downloaded" movies={mostDownloaded} />
        <MovieList title="Latest YTS Releases" movies={latestMovies} />
      </div>
    </div>
  );
}
