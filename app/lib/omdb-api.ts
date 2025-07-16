
import { OMDBResponse } from './types';

export class OMDBClient {
  private baseUrl = 'https://www.omdbapi.com/';
  private apiKey = process.env.OMDB_API_KEY || 'YOUR_API_KEY_HERE';

  async searchByTitle(title: string, year?: string): Promise<OMDBResponse | null> {
    try {
      const params = new URLSearchParams({
        apikey: this.apiKey,
        t: this.cleanTitle(title),
        type: 'movie',
        plot: 'short'
      });

      if (year) {
        params.append('y', year);
      }

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OMDBResponse = await response.json();
      
      if (data.Response === 'False') {
        return null;
      }

      return data;
    } catch (error) {
      console.error('OMDB API Error:', error);
      return null;
    }
  }

  async searchByImdbId(imdbId: string): Promise<OMDBResponse | null> {
    try {
      const params = new URLSearchParams({
        apikey: this.apiKey,
        i: imdbId,
        plot: 'short'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OMDBResponse = await response.json();
      
      if (data.Response === 'False') {
        return null;
      }

      return data;
    } catch (error) {
      console.error('OMDB API Error:', error);
      return null;
    }
  }

  private cleanTitle(title: string): string {
    // Entfernt deutsche Artikel und Suffixe für bessere IMDB-Suche
    return title
      .replace(/^(Der|Die|Das|Ein|Eine)\s+/i, '')
      .replace(/\s+\(.*\)$/, '')
      .replace(/\s+Teil\s+\d+$/i, '')
      .replace(/\s+Folge\s+\d+$/i, '')
      .replace(/\s+Episode\s+\d+$/i, '')
      .replace(/\s*-\s*Staffel\s+\d+$/i, '')
      .trim();
  }

  extractImdbRating(omdbData: OMDBResponse): number | null {
    if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
      const rating = parseFloat(omdbData.imdbRating);
      return !isNaN(rating) ? rating : null;
    }
    return null;
  }

  extractYear(omdbData: OMDBResponse): string | null {
    if (omdbData.Year && omdbData.Year !== 'N/A') {
      return omdbData.Year;
    }
    return null;
  }

  extractGenres(omdbData: OMDBResponse): string[] {
    if (omdbData.Genre && omdbData.Genre !== 'N/A') {
      return omdbData.Genre.split(', ');
    }
    return [];
  }

  extractPoster(omdbData: OMDBResponse): string | null {
    if (omdbData.Poster && omdbData.Poster !== 'N/A') {
      return omdbData.Poster;
    }
    return null;
  }
}

export const omdbClient = new OMDBClient();
