'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { genres as allGenres, qualities as allQualities } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SearchFiltersProps {
  onGenreChange: (genres: string[]) => void;
  onQualityChange: (qualities: string[]) => void;
  onRatingChange: (rating: number) => void;
  onSortChange: (sortBy: string) => void;
  onOrderChange: (order: 'asc' | 'desc') => void;
}

export default function SearchFilters({
  onGenreChange,
  onQualityChange,
  onRatingChange,
  onSortChange,
  onOrderChange,
}: SearchFiltersProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState('rating');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const handleGenreChange = (genre: string, checked: boolean) => {
    const newGenres = checked
      ? [...selectedGenres, genre]
      : selectedGenres.filter((g) => g !== genre);
    setSelectedGenres(newGenres);
    onGenreChange(newGenres);
  };

  const handleQualityChange = (quality: string, checked: boolean) => {
    const newQualities = checked
      ? [...selectedQualities, quality]
      : selectedQualities.filter((q) => q !== quality);
    setSelectedQualities(newQualities);
    onQualityChange(newQualities);
  };
  
  const handleRatingChange = (value: number[]) => {
    setRating(value[0]);
    onRatingChange(value[0]);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  }

  const handleOrderChange = (value: 'asc' | 'desc') => {
    setOrder(value);
    onOrderChange(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter & Sort</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="multiple" defaultValue={['sort', 'rating', 'genres']} className="w-full">
          <AccordionItem value="sort">
            <AccordionTrigger>Sort By</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="like_count">Likes</SelectItem>
                  <SelectItem value="download_count">Downloads</SelectItem>
                  <SelectItem value="date_added">Date Added</SelectItem>
                </SelectContent>
              </Select>
              <Select value={order} onValueChange={(v: any) => handleOrderChange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        
          <AccordionItem value="rating">
            <AccordionTrigger>Minimum Rating</AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="flex items-center justify-between">
                <Label>Rating: {rating}+</Label>
              </div>
              <Slider
                defaultValue={[0]}
                max={9}
                step={1}
                onValueChange={handleRatingChange}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="genres">
            <AccordionTrigger>Genres</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2 h-48 overflow-y-auto">
              {allGenres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    onCheckedChange={(checked) => handleGenreChange(genre, !!checked)}
                  />
                  <Label htmlFor={`genre-${genre}`}>{genre}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="quality">
            <AccordionTrigger>Quality</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {allQualities.map((quality) => (
                <div key={quality} className="flex items-center space-x-2">
                  <Checkbox
                    id={`quality-${quality}`}
                    onCheckedChange={(checked) => handleQualityChange(quality, !!checked)}
                  />
                  <Label htmlFor={`quality-${quality}`}>{quality}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}