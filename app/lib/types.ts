
export interface MediathekVideo {
  id: string;
  channel: string;
  topic: string;
  title: string;
  description: string;
  timestamp: string;
  duration: number;
  size: number;
  url_website: string;
  url_video: string;
  url_video_low: string;
  url_video_hd: string;
  url_subtitle?: string;
  filmlisteTimestamp?: string;
  geo?: string;
  new?: boolean;
  metadata?: VideoMetadata;
}

export interface MediathekSearchQuery {
  queries: Array<{
    fields: string[];
    query: string;
  }>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  future?: boolean;
  offset?: number;
  size?: number;
  duration_min?: number;
  duration_max?: number;
}

export interface MediathekSearchResult {
  result: {
    results: MediathekVideo[];
    resultsTotal: number;
    queryInfo: {
      totalResults: number;
      filmlisteTimestamp: string;
    };
  };
}

export interface OMDBResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

export interface UserRating {
  id: string;
  videoId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  channel: string;
  topic?: string;
  thumbnail?: string;
  duration?: number;
  createdAt: Date;
}

export interface VideoMetadata {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  topic?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  imdbRating?: number;
  imdbId?: string;
  viewCount: number;
  avgRating?: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  channel?: string;
  topic?: string;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  year?: string;
  sortBy?: 'timestamp' | 'title' | 'duration' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface Language {
  code: 'de' | 'en';
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export const CHANNELS = [
  'ARD',
  'ZDF',
  'ARTE',
  '3Sat',
  'WDR',
  'BR',
  'HR',
  'MDR',
  'NDR',
  'RBB',
  'SR',
  'SWR',
  'ZDFinfo',
  'ZDFneo',
  'zdf-tivi',
  'Funk',
  'Kika',
  'Phoenix',
  'DW'
];

export const GENRES = [
  'Spielfilm',
  'Krimi',
  'Dokumentation',
  'Reportage',
  'Nachrichten',
  'Sport',
  'Kultur',
  'Wissenschaft',
  'Kinder',
  'Comedy',
  'Thriller',
  'Drama',
  'Action',
  'Historisch',
  'Natur',
  'Musik',
  'Talk',
  'Show'
];
