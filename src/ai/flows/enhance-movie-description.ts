'use server';

/**
 * @fileOverview An AI agent that enhances movie descriptions to be more engaging and informative.
 *
 * - enhanceMovieDescription - A function that enhances a movie description.
 * - EnhanceMovieDescriptionInput - The input type for the enhanceMovieDescription function.
 * - EnhanceMovieDescriptionOutput - The return type for the enhanceMovieDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceMovieDescriptionInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie.'),
  originalDescription: z.string().describe('The original movie description.'),
});
export type EnhanceMovieDescriptionInput = z.infer<typeof EnhanceMovieDescriptionInputSchema>;

const EnhanceMovieDescriptionOutputSchema = z.object({
  enhancedDescription: z.string().describe('The enhanced movie description.'),
});
export type EnhanceMovieDescriptionOutput = z.infer<typeof EnhanceMovieDescriptionOutputSchema>;

export async function enhanceMovieDescription(input: EnhanceMovieDescriptionInput): Promise<EnhanceMovieDescriptionOutput> {
  return enhanceMovieDescriptionFlow(input);
}

const enhanceMovieDescriptionPrompt = ai.definePrompt({
  name: 'enhanceMovieDescriptionPrompt',
  input: {schema: EnhanceMovieDescriptionInputSchema},
  output: {schema: EnhanceMovieDescriptionOutputSchema},
  prompt: `You are a movie critic tasked with enhancing movie descriptions to be more engaging and informative for potential viewers.

  Movie Title: {{{movieTitle}}}
  Original Description: {{{originalDescription}}}

  Enhanced Description:`, // Removed the trailing newline
});

const enhanceMovieDescriptionFlow = ai.defineFlow(
  {
    name: 'enhanceMovieDescriptionFlow',
    inputSchema: EnhanceMovieDescriptionInputSchema,
    outputSchema: EnhanceMovieDescriptionOutputSchema,
  },
  async input => {
    const {output} = await enhanceMovieDescriptionPrompt(input);
    return output!;
  }
);
