import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/lib/types';
import { Star, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`} className={cn('group block overflow-hidden rounded-lg', className)}>
      <div className="relative aspect-[2/3] bg-card">
        <Image
          src={movie.medium_cover_image}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 w-full p-4 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
          <h3 className="truncate font-bold">{movie.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{movie.year}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-primary" />
              <span>{movie.rating}</span>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="absolute right-2 top-2">{movie.genres[0]}</Badge>
      </div>
    </Link>
  );
}
