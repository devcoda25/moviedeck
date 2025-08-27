import { Clapperboard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MovieLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2 text-2xl font-black text-white transition-colors hover:text-primary',
        className
      )}
    >
      <Clapperboard className="h-7 w-7 text-primary" />
      <span className="font-headline tracking-tighter">MovieDeck</span>
    </Link>
  );
}
