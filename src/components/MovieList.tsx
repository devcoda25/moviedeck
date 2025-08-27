import type { Movie } from '@/lib/types';
import MovieCard from './MovieCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface MovieListProps {
  title: string;
  movies: Movie[];
}

export default function MovieList({ title, movies }: MovieListProps) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-white font-headline">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {movies.map((movie) => (
            <CarouselItem key={movie.id} className="basis-1/2 pl-4 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <MovieCard movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-14" />
        <CarouselNext className="mr-14" />
      </Carousel>
    </section>
  );
}
