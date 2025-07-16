
'use client';

import { useState, useEffect } from 'react';
import { Search, Bookmark, Settings, Menu, X, Globe, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { watchlistManager } from '@/lib/watchlist';
import { t, Language } from '@/lib/i18n';
import Link from 'next/link';

interface HeaderProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function Header({ language = 'de', onLanguageChange }: HeaderProps) {
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateWatchlistCount = () => {
      setWatchlistCount(watchlistManager.getWatchlistCount());
    };
    
    updateWatchlistCount();
    
    // Update count when localStorage changes
    const handleStorageChange = () => {
      updateWatchlistCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for watchlist updates
    window.addEventListener('watchlistUpdated', updateWatchlistCount);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistUpdated', updateWatchlistCount);
    };
  }, []);

  const navigationItems = [
    { label: t('home', language), href: '/', icon: Home },
    { label: t('search', language), href: '/search', icon: Search },
    { label: t('watchlist', language), href: '/watchlist', icon: Bookmark, badge: watchlistCount },
    { label: t('settings', language), href: '/settings', icon: Settings }
  ];

  const NavigationContent = () => (
    <div className="flex flex-col space-y-2 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
      
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Globe className="w-5 h-5" />
          <span className="font-medium">{t('language', language)}</span>
        </div>
        <div className="px-3">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">Mediathek</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Language Selector */}
          <div className="hidden md:flex items-center gap-2">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold">Navigation</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
