'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllMovies } from '@/lib/data';
import MovieCard from '@/components/MovieCard';
import SearchFilters from '@/components/SearchFilters';
import type { Movie } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function MovieGrid({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) {
    return <p className="text-center text-muted-foreground">No movies found that match your criteria.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for filters
  const [quality, setQuality] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    setIsLoading(true);
    const filterOptions: Record<string, any> = {
      query_term: query,
      genre: genres.join(','),
      quality: quality.join(','),
      minimum_rating: minRating,
      sort_by: sortBy,
      order_by: order,
    };
    
    getAllMovies(filterOptions).then(movies => {
      setMovies(movies);
      setIsLoading(false);
    });
  }, [query, genres, quality, minRating, sortBy, order]);

  const loadingSkeletons = Array.from({ length: 18 }).map((_, i) => (
    <div key={i} className="space-y-2">
      <Skeleton className="h-auto w-full aspect-[2/3]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ));
  
  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-64 lg:w-72">
          <SearchFilters
            onGenreChange={setGenres}
            onQualityChange={setQuality}
            onRatingChange={setMinRating}
            onSortChange={setSortBy}
            onOrderChange={setOrder}
          />
        </aside>
        <main className="flex-1">
          <h1 className="mb-6 text-3xl font-bold tracking-tight font-headline">
            {query ? `Search Results for "${query}"` : 'Browse All Movies'}
          </h1>
          {isLoading ? (
             <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {loadingSkeletons}
            </div>
          ) : (
            <MovieGrid movies={movies} />
          )}
        </main>
      </div>
    </div>
  );
}


export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowsePageContent />
    </Suspense>
  );
}