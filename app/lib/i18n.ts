
export const translations = {
  de: {
    // Navigation
    home: 'Startseite',
    search: 'Suchen',
    watchlist: 'Merkliste',
    settings: 'Einstellungen',
    
    // Search & Filter
    searchPlaceholder: 'Filme, Serien, Dokus suchen...',
    filter: 'Filter',
    sortBy: 'Sortieren nach',
    channel: 'Sender',
    allChannels: 'Alle Sender',
    duration: 'Dauer',
    rating: 'Bewertung',
    year: 'Jahr',
    genre: 'Genre',
    newest: 'Neueste',
    oldest: 'Älteste',
    titleAZ: 'Titel A-Z',
    titleZA: 'Titel Z-A',
    ratingHigh: 'Bewertung hoch',
    ratingLow: 'Bewertung niedrig',
    durationLong: 'Längste',
    durationShort: 'Kürzeste',
    
    // Video Details
    play: 'Abspielen',
    addToWatchlist: 'Zur Merkliste hinzufügen',
    removeFromWatchlist: 'Aus Merkliste entfernen',
    share: 'Teilen',
    description: 'Beschreibung',
    details: 'Details',
    similar: 'Ähnliche Inhalte',
    
    // Ratings
    imdbRating: 'IMDB-Bewertung',
    userRating: 'Nutzerbewertung',
    rateThis: 'Bewerten',
    yourRating: 'Ihre Bewertung',
    submitRating: 'Bewertung abgeben',
    
    // Time & Duration
    minutes: 'Minuten',
    hours: 'Stunden',
    ago: 'vor',
    videoDuration: 'Dauer',
    
    // Messages
    noResults: 'Keine Ergebnisse gefunden',
    loading: 'Laden...',
    error: 'Fehler beim Laden',
    tryAgain: 'Erneut versuchen',
    emptyWatchlist: 'Ihre Merkliste ist leer',
    
    // Categories
    movies: 'Filme',
    series: 'Serien',
    documentaries: 'Dokumentationen',
    news: 'Nachrichten',
    kids: 'Kinder',
    sport: 'Sport',
    culture: 'Kultur',
    
    // Settings
    language: 'Sprache',
    theme: 'Design',
    videoQuality: 'Video-Qualität',
    autoplay: 'Autoplay',
    
    // Footer
    about: 'Über uns',
    contact: 'Kontakt',
    privacy: 'Datenschutz',
    imprint: 'Impressum'
  },
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    watchlist: 'Watchlist',
    settings: 'Settings',
    
    // Search & Filter
    searchPlaceholder: 'Search movies, series, documentaries...',
    filter: 'Filter',
    sortBy: 'Sort by',
    channel: 'Channel',
    allChannels: 'All Channels',
    duration: 'Duration',
    rating: 'Rating',
    year: 'Year',
    genre: 'Genre',
    newest: 'Newest',
    oldest: 'Oldest',
    titleAZ: 'Title A-Z',
    titleZA: 'Title Z-A',
    ratingHigh: 'Highest rated',
    ratingLow: 'Lowest rated',
    durationLong: 'Longest',
    durationShort: 'Shortest',
    
    // Video Details
    play: 'Play',
    addToWatchlist: 'Add to Watchlist',
    removeFromWatchlist: 'Remove from Watchlist',
    share: 'Share',
    description: 'Description',
    details: 'Details',
    similar: 'Similar Content',
    
    // Ratings
    imdbRating: 'IMDB Rating',
    userRating: 'User Rating',
    rateThis: 'Rate This',
    yourRating: 'Your Rating',
    submitRating: 'Submit Rating',
    
    // Time & Duration
    minutes: 'minutes',
    hours: 'hours',
    ago: 'ago',
    videoDuration: 'Duration',
    
    // Messages
    noResults: 'No results found',
    loading: 'Loading...',
    error: 'Error loading',
    tryAgain: 'Try again',
    emptyWatchlist: 'Your watchlist is empty',
    
    // Categories
    movies: 'Movies',
    series: 'Series',
    documentaries: 'Documentaries',
    news: 'News',
    kids: 'Kids',
    sport: 'Sport',
    culture: 'Culture',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    videoQuality: 'Video Quality',
    autoplay: 'Autoplay',
    
    // Footer
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
    imprint: 'Imprint'
  }
};

export type Language = 'de' | 'en';
export type TranslationKey = keyof typeof translations.de;

export function t(key: TranslationKey, lang: Language = 'de'): string {
  return translations[lang][key] || translations.de[key] || key;
}
