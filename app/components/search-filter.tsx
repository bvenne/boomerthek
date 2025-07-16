
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterOptions, CHANNELS, GENRES } from '@/lib/types';
import { t } from '@/lib/i18n';

interface SearchFilterProps {
  language?: 'de' | 'en';
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterOptions) => void;
  initialQuery?: string;
}

export default function SearchFilter({ 
  language = 'de', 
  onSearch, 
  onFilter, 
  initialQuery = '' 
}: SearchFilterProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch?.(searchQuery);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      sortBy: 'timestamp',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFilter?.(defaultFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.channel) count++;
    if (filters.topic) count++;
    if (filters.minDuration && filters.minDuration > 0) count++;
    if (filters.maxDuration && filters.maxDuration < 7200) count++;
    if (filters.minRating && filters.minRating > 0) count++;
    if (filters.year) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t('searchPlaceholder', language)}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-12"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearch('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {t('filter', language)}
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFilterCount()}
            </Badge>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
        
        {getActiveFilterCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('filter', language)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('sortBy', language)}
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">{t('newest', language)}</SelectItem>
                    <SelectItem value="title">{t('titleAZ', language)}</SelectItem>
                    <SelectItem value="duration">{t('durationLong', language)}</SelectItem>
                    <SelectItem value="rating">{t('ratingHigh', language)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Order
                </label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) => handleFilterChange('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Channel Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('channel', language)}
              </label>
              <Select
                value={filters.channel || 'all'}
                onValueChange={(value) => handleFilterChange('channel', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allChannels', language)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allChannels', language)}</SelectItem>
                  {CHANNELS.map(channel => (
                    <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('genre', language)}
              </label>
              <Select
                value={filters.topic || 'all'}
                onValueChange={(value) => handleFilterChange('topic', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {GENRES.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('videoDuration', language)} ({Math.floor((filters.minDuration || 0) / 60)}m - {Math.floor((filters.maxDuration || 7200) / 60)}m)
              </label>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Min Duration</span>
                  <Slider
                    value={[filters.minDuration || 0]}
                    onValueChange={(value) => handleFilterChange('minDuration', value[0])}
                    max={7200}
                    step={300}
                    className="w-full"
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Max Duration</span>
                  <Slider
                    value={[filters.maxDuration || 7200]}
                    onValueChange={(value) => handleFilterChange('maxDuration', value[0])}
                    max={7200}
                    step={300}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('rating', language)} ({filters.minRating || 0}+ ⭐)
              </label>
              <Slider
                value={[filters.minRating || 0]}
                onValueChange={(value) => handleFilterChange('minRating', value[0])}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Year Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('year', language)}
              </label>
              <Select
                value={filters.year || 'all'}
                onValueChange={(value) => handleFilterChange('year', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
