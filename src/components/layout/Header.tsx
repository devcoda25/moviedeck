'use client';

import { MovieLogo } from '@/components/MovieLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Home, ListVideo, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent, Suspense } from 'react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: ListVideo },
  { href: '/downloads', label: 'Downloads', icon: Download },
];

function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
    const handleSearch = (e: FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
         router.push(`/browse`);
      }
    };

    return (
        <form onSubmit={handleSearch} className="relative hidden w-64 lg:block">
            <Input
              type="search"
              placeholder="Search movies..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
    );
}

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <MovieLogo />
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-primary',
                  pathname === href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="h-10 w-64 bg-muted rounded-md hidden lg:block" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
