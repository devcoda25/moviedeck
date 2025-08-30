
'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAllMovies } from '@/lib/data';
import MovieCard from '@/components/MovieCard';
import SearchFilters from '@/components/SearchFilters';
import type { Movie } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // States for filters
  const [quality, setQuality] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  const query = searchParams.get('q') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setIsLoading(true);
    const filterOptions: Record<string, any> = {
      query_term: query,
      genre: genres.join(','),
      quality: quality.join(','),
      minimum_rating: minRating,
      sort_by: sortBy,
      order_by: order,
      page: currentPage,
      limit: 18, // Let's use a smaller limit for pagination
    };
    
    getAllMovies(filterOptions).then(data => {
      setMovies(data.movies);
      setTotalPages(Math.ceil(data.movie_count / data.limit));
      setIsLoading(false);
    });
  }, [query, genres, quality, minRating, sortBy, order, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

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
            <>
              <MovieGrid movies={movies} />
              {totalPages > 1 && (
                 <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                          />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="p-2 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                 </div>
              )}
            </>
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
