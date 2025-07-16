
import { WatchlistItem } from './types';

export class WatchlistManager {
  private storageKey = 'mediathek-watchlist';

  getWatchlist(): WatchlistItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  }

  addToWatchlist(item: Omit<WatchlistItem, 'id' | 'createdAt'>): void {
    if (typeof window === 'undefined') return;
    
    const watchlist = this.getWatchlist();
    const existingIndex = watchlist.findIndex(w => w.videoId === item.videoId);
    
    if (existingIndex === -1) {
      const newItem: WatchlistItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      
      watchlist.unshift(newItem);
      localStorage.setItem(this.storageKey, JSON.stringify(watchlist));
    }
  }

  removeFromWatchlist(videoId: string): void {
    if (typeof window === 'undefined') return;
    
    const watchlist = this.getWatchlist();
    const filtered = watchlist.filter(item => item.videoId !== videoId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  isInWatchlist(videoId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.videoId === videoId);
  }

  clearWatchlist(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.storageKey);
  }

  getWatchlistCount(): number {
    return this.getWatchlist().length;
  }
}

export const watchlistManager = new WatchlistManager();
