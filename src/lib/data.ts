import type { Movie, CastMember, Torrent } from './types';

const movies: Movie[] = [
  {
    id: 1,
    url: '',
    imdb_code: 'tt1375666',
    title: 'Inception',
    title_english: 'Inception',
    title_long: 'Inception (2010)',
    slug: 'inception-2010',
    year: 2010,
    rating: 8.8,
    runtime: 148,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    summary: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    description_full: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    yt_trailer_code: 'YoHD9XEInc0',
    language: 'English',
    mpa_rating: 'PG-13',
    background_image: 'https://picsum.photos/1920/1080?random=1',
    background_image_original: 'https://picsum.photos/1920/1080?random=1',
    small_cover_image: 'https://picsum.photos/230/345?random=1',
    medium_cover_image: 'https://picsum.photos/460/690?random=1',
    large_cover_image: 'https://picsum.photos/510/765?random=1',
    state: 'ok',
    torrents: [
      { url: '', hash: 'hash1_720', quality: '720p', type: 'bluray', seeds: 125, peers: 50, size: '1.4 GB', size_bytes: 1503238553, date_uploaded: '', date_uploaded_unix: 0 },
      { url: '', hash: 'hash1_1080', quality: '1080p', type: 'bluray', seeds: 250, peers: 100, size: '2.5 GB', size_bytes: 2684354560, date_uploaded: '', date_uploaded_unix: 0 },
    ],
    date_uploaded: '2023-10-27 15:00:00',
    date_uploaded_unix: 1698393600,
    cast: [
      { name: 'Leonardo DiCaprio', character_name: 'Cobb', url_small_image: 'https://picsum.photos/40/40?random=11', imdb_code: '' },
      { name: 'Joseph Gordon-Levitt', character_name: 'Arthur', url_small_image: 'https://picsum.photos/40/40?random=12', imdb_code: '' }
    ]
  },
  {
    id: 2,
    url: '',
    imdb_code: 'tt0816692',
    title: 'Interstellar',
    title_english: 'Interstellar',
    title_long: 'Interstellar (2014)',
    slug: 'interstellar-2014',
    year: 2014,
    rating: 8.6,
    runtime: 169,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    summary: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    description_full: 'In Earth\'s future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand (Michael Caine), a brilliant NASA physicist, is working on plans to save mankind by transporting Earth\'s population to a new home via a wormhole. But first, Brand must send former NASA pilot Cooper (Matthew McConaughey) and a team of researchers through the wormhole and across the galaxy to find out which of three planets could be mankind\'s new home.',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    yt_trailer_code: 'zSWdZVtXT7E',
    language: 'English',
    mpa_rating: 'PG-13',
    background_image: 'https://picsum.photos/1920/1080?random=2',
    background_image_original: 'https://picsum.photos/1920/1080?random=2',
    small_cover_image: 'https://picsum.photos/230/345?random=2',
    medium_cover_image: 'https://picsum.photos/460/690?random=2',
    large_cover_image: 'https://picsum.photos/510/765?random=2',
    state: 'ok',
    torrents: [
      { url: '', hash: 'hash2_1080', quality: '1080p', type: 'bluray', seeds: 300, peers: 120, size: '3.1 GB', size_bytes: 3328599654, date_uploaded: '', date_uploaded_unix: 0 },
      { url: '', hash: 'hash2_2160', quality: '2160p', type: 'bluray', seeds: 150, peers: 60, size: '12.5 GB', size_bytes: 13421772800, date_uploaded: '', date_uploaded_unix: 0 },
    ],
    date_uploaded: '2023-11-15 12:00:00',
    date_uploaded_unix: 1700049600,
    cast: [
      { name: 'Matthew McConaughey', character_name: 'Cooper', url_small_image: 'https://picsum.photos/40/40?random=21', imdb_code: '' },
      { name: 'Anne Hathaway', character_name: 'Brand', url_small_image: 'https://picsum.photos/40/40?random=22', imdb_code: '' },
      { name: 'Jessica Chastain', character_name: 'Murph', url_small_image: 'https://picsum.photos/40/40?random=23', imdb_code: '' },
    ]
  },
  {
    id: 3,
    url: '',
    imdb_code: 'tt0109830',
    title: 'Forrest Gump',
    title_english: 'Forrest Gump',
    title_long: 'Forrest Gump (1994)',
    slug: 'forrest-gump-1994',
    year: 1994,
    rating: 8.8,
    runtime: 142,
    genres: ['Drama', 'Romance'],
    summary: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
    description_full: 'Slow-witted Forrest Gump (Tom Hanks) has never thought of himself as disadvantaged, and thanks to his supportive mother (Sally Field), he leads anything but a restricted life. Whether dominating on the gridiron as a college football star, fighting in Vietnam or captaining a shrimp boat, Forrest inspires people with his childlike optimism. But one person Forrest cares about most may be the most difficult to save: his childhood love, the troubled Jenny (Robin Wright).',
    synopsis: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
    yt_trailer_code: 'bLvqoHBptjg',
    language: 'English',
    mpa_rating: 'PG-13',
    background_image: 'https://picsum.photos/1920/1080?random=3',
    background_image_original: 'https://picsum.photos/1920/1080?random=3',
    small_cover_image: 'https://picsum.photos/230/345?random=3',
    medium_cover_image: 'https://picsum.photos/460/690?random=3',
    large_cover_image: 'https://picsum.photos/510/765?random=3',
    state: 'ok',
    torrents: [
        { url: '', hash: 'hash3_720', quality: '720p', type: 'web', seeds: 90, peers: 25, size: '1.1 GB', size_bytes: 1181116006, date_uploaded: '', date_uploaded_unix: 0 },
        { url: '', hash: 'hash3_1080', quality: '1080p', type: 'bluray', seeds: 180, peers: 70, size: '2.2 GB', size_bytes: 2362232012, date_uploaded: '', date_uploaded_unix: 0 },
    ],
    date_uploaded: '2024-01-01 10:00:00',
    date_uploaded_unix: 1704103200,
    cast: [
        { name: 'Tom Hanks', character_name: 'Forrest Gump', url_small_image: 'https://picsum.photos/40/40?random=31', imdb_code: '' },
        { name: 'Robin Wright', character_name: 'Jenny Curran', url_small_image: 'https://picsum.photos/40/40?random=32', imdb_code: '' },
    ]
  },
  {
    id: 4,
    url: '',
    imdb_code: 'tt7286456',
    title: 'Joker',
    title_english: 'Joker',
    title_long: 'Joker (2019)',
    slug: 'joker-2019',
    year: 2019,
    rating: 8.4,
    runtime: 122,
    genres: ['Crime', 'Drama', 'Thriller'],
    summary: 'A mentally troubled comedian embarks on a downward spiral of social revolution and bloody crime in Gotham City.',
    description_full: 'Forever alone in a crowd, failed comedian Arthur Fleck seeks connection as he walks the streets of Gotham City. Arthur wears two masks -- the one he paints for his day job as a clown, and the guise he projects in a futile attempt to feel like he\'s part of the world around him. Isolated, bullied and disregarded by society, Fleck begins a slow descent into madness as he transforms into the criminal mastermind known as the Joker.',
    synopsis: 'A mentally troubled comedian embarks on a downward spiral of social revolution and bloody crime in Gotham City.',
    yt_trailer_code: 'zAGVQLHvwOY',
    language: 'English',
    mpa_rating: 'R',
    background_image: 'https://picsum.photos/1920/1080?random=4',
    background_image_original: 'https://picsum.photos/1920/1080?random=4',
    small_cover_image: 'https://picsum.photos/230/345?random=4',
    medium_cover_image: 'https://picsum.photos/460/690?random=4',
    large_cover_image: 'https://picsum.photos/510/765?random=4',
    state: 'ok',
    torrents: [
      { url: '', hash: 'hash4_1080', quality: '1080p', type: 'bluray', seeds: 450, peers: 180, size: '2.8 GB', size_bytes: 3006477107, date_uploaded: '', date_uploaded_unix: 0 },
      { url: '', hash: 'hash4_2160', quality: '2160p', type: 'webrip', seeds: 220, peers: 90, size: '10.1 GB', size_bytes: 10844792422, date_uploaded: '', date_uploaded_unix: 0 },
    ],
    date_uploaded: '2023-09-05 18:30:00',
    date_uploaded_unix: 1693938600,
    cast: [
        { name: 'Joaquin Phoenix', character_name: 'Arthur Fleck / Joker', url_small_image: 'https://picsum.photos/40/40?random=41', imdb_code: '' },
        { name: 'Robert De Niro', character_name: 'Murray Franklin', url_small_image: 'https://picsum.photos/40/40?random=42', imdb_code: '' },
    ]
  },
  {
    id: 5,
    url: '',
    imdb_code: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    title_english: 'Spider-Man: Across the Spider-Verse',
    title_long: 'Spider-Man: Across the Spider-Verse (2023)',
    slug: 'spider-man-across-the-spider-verse-2023',
    year: 2023,
    rating: 8.7,
    runtime: 140,
    genres: ['Animation', 'Action', 'Adventure'],
    summary: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must redefine what it means to be a hero.',
    description_full: 'After reuniting with Gwen Stacy, Brooklyn\'s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must redefine what it means to be a hero.',
    synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    yt_trailer_code: 'shW9i6k8cB0',
    language: 'English',
    mpa_rating: 'PG',
    background_image: 'https://picsum.photos/1920/1080?random=5',
    background_image_original: 'https://picsum.photos/1920/1080?random=5',
    small_cover_image: 'https://picsum.photos/230/345?random=5',
    medium_cover_image: 'https://picsum.photos/460/690?random=5',
    large_cover_image: 'https://picsum.photos/510/765?random=5',
    state: 'ok',
    torrents: [
      { url: '', hash: 'hash5_720', quality: '720p', type: 'web', seeds: 1200, peers: 400, size: '1.2 GB', size_bytes: 1288490188, date_uploaded: '', date_uploaded_unix: 0 },
      { url: '', hash: 'hash5_1080', quality: '1080p', type: 'web', seeds: 2500, peers: 800, size: '2.9 GB', size_bytes: 3113851289, date_uploaded: '', date_uploaded_unix: 0 },
    ],
    date_uploaded: '2024-02-20 09:00:00',
    date_uploaded_unix: 1708423200,
    cast: [
      { name: 'Shameik Moore', character_name: 'Miles Morales (voice)', url_small_image: 'https://picsum.photos/40/40?random=51', imdb_code: '' },
      { name: 'Hailee Steinfeld', character_name: 'Gwen Stacy (voice)', url_small_image: 'https://picsum.photos/40/40?random=52', imdb_code: '' },
    ]
  },
  {
    id: 6,
    url: '',
    imdb_code: 'tt1517268',
    title: 'Barbie',
    title_english: 'Barbie',
    title_long: 'Barbie (2023)',
    slug: 'barbie-2023',
    year: 2023,
    rating: 7.0,
    runtime: 114,
    genres: ['Adventure', 'Comedy', 'Fantasy'],
    summary: 'Barbie suffers a crisis that leads her to question her world and her existence.',
    description_full: 'To live in Barbie Land is to be a perfect being in a perfect place. Unless you have a full-on existential crisis. Or you\'re a Ken. From Oscar-nominated writer/director Greta Gerwig comes "Barbie," starring Oscar-nominees Margot Robbie and Ryan Gosling as Barbie and Ken.',
    synopsis: 'Barbie suffers a crisis that leads her to question her world and her existence.',
    yt_trailer_code: 'pBk4NYhWNMM',
    language: 'English',
    mpa_rating: 'PG-13',
    background_image: 'https://picsum.photos/1920/1080?random=6',
    background_image_original: 'https://picsum.photos/1920/1080?random=6',
    small_cover_image: 'https://picsum.photos/230/345?random=6',
    medium_cover_image: 'https://picsum.photos/460/690?random=6',
    large_cover_image: 'https://picsum.photos/510/765?random=6',
    state: 'ok',
    torrents: [
      { url: '', hash: 'hash6_1080', quality: '1080p', type: 'web', seeds: 1800, peers: 600, size: '2.3 GB', size_bytes: 2469606195, date_uploaded: '', date_uploaded_unix: 0 },
    ],
    date_uploaded: '2024-02-18 11:00:00',
    date_uploaded_unix: 1708254000,
    cast: [
      { name: 'Margot Robbie', character_name: 'Barbie', url_small_image: 'https://picsum.photos/40/40?random=61', imdb_code: '' },
      { name: 'Ryan Gosling', character_name: 'Ken', url_small_image: 'https://picsum.photos/40/40?random=62', imdb_code: '' },
    ]
  },
];


// Simulate API calls
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAllMovies(): Promise<Movie[]> {
  await sleep(500);
  return movies;
}

export async function getMovieById(id: number): Promise<Movie | undefined> {
  await sleep(300);
  const movie = movies.find(m => m.id === id);
  if (movie) {
    // Simulate suggestions
    return {
      ...movie,
      suggestions: movies.filter(m => m.id !== id && m.genres.some(g => movie.genres.includes(g))).slice(0, 4)
    };
  }
  return undefined;
}

export async function getHighestRatedMovies(): Promise<Movie[]> {
  await sleep(400);
  return [...movies].sort((a, b) => b.rating - a.rating);
}

export async function getMostDownloadedMovies(): Promise<Movie[]> {
  await sleep(600);
  // We don't have download_count, so we'll sort by seeds as a proxy
  return [...movies].sort((a, b) => {
    const seedsA = a.torrents.reduce((sum, t) => sum + t.seeds, 0);
    const seedsB = b.torrents.reduce((sum, t) => sum + t.seeds, 0);
    return seedsB - seedsA;
  });
}

export async function getLatestMovies(): Promise<Movie[]> {
  await sleep(700);
  return [...movies].sort((a, b) => b.date_uploaded_unix - a.date_uploaded_unix);
}

export const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family',
  'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western'
];

export const qualities = ['720p', '1080p', '2160p', '3D'];
