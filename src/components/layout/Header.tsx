'use client';

import { MovieLogo } from '@/components/MovieLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Home, ListVideo, Search, Download, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent, Suspense } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSearchParams } from 'next/navigation';


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
        <form onSubmit={handleSearch} className="relative w-full">
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

function HeaderContent() {
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
          <div className='hidden lg:block w-64'>
             <SearchBar />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="text-2xl">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  <div className='lg:hidden'>
                    <SearchBar />
                  </div>
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <SheetClose key={href} asChild>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg p-3 text-lg transition-colors hover:bg-muted',
                          pathname === href ? 'bg-muted text-primary' : 'text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}


export default function Header() {
  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-border/40 bg-background/95" />}>
      <HeaderContent />
    </Suspense>
  )
}