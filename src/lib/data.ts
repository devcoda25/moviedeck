import type { Movie } from './types';

const API_BASE_URL = 'https://yts.mx/api/v2';

async function fetchYTS(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YTS API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.status !== 'ok') {
      throw new Error(`YTS API error: ${data.status_message}`);
    }
    return data.data;
  } catch (error) {
    console.error("Failed to fetch from YTS API:", error);
    // Return a structure that won't break the app
    return { movies: [], movie: null };
  }
}

export async function getAllMovies(options: Record<string, any> = {}): Promise<Movie[]> {
  const { movies } = await fetchYTS('list_movies.json', { limit: 50, ...options });
  return movies || [];
}

export async function getMovieById(id: number): Promise<Movie | undefined> {
  const { movie } = await fetchYTS('movie_details.json', { movie_id: id, with_cast: true, with_images: true });
  if (movie) {
    const { movies: suggestions } = await fetchYTS('movie_suggestions.json', { movie_id: id });
    movie.suggestions = suggestions || [];
  }
  return movie;
}

export async function getHighestRatedMovies(): Promise<Movie[]> {
  const { movies } = await fetchYTS('list_movies.json', { sort_by: 'rating', limit: 20 });
  return movies || [];
}

export async function getMostDownloadedMovies(): Promise<Movie[]> {
  const { movies } = await fetchYTS('list_movies.json', { sort_by: 'download_count', limit: 20 });
  return movies || [];
}

export async function getLatestMovies(): Promise<Movie[]> {
  const { movies } = await fetchYTS('list_movies.json', { sort_by: 'date_added', limit: 20 });
  return movies || [];
}

export const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family',
  'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western'
];

export const qualities = ['720p', '1080p', '2160p', '3D'];