import { MovieLogo } from "@/components/MovieLogo";

export default function Footer() {
  return (
    <footer className="mt-auto border-t py-6">
      <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row lg:px-8">
        <MovieLogo />
        <p className="mt-4 text-sm text-muted-foreground md:mt-0">
          &copy; {new Date().getFullYear()} MovieDeck. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
