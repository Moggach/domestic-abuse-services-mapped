'use client';
import type { ReactNode } from 'react';
import React, { createContext, useState, useContext } from 'react';

import {
  calculateDistance,
  determineZoomLevel,
  isPartialPostcode,
  isPostcode,
} from '../lib/geo';
import { lookupPostcode } from '../lib/postcodes';

interface SearchContextType {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  submittedSearchQuery: string;
  setSubmittedSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchSubmitted: boolean;
  setSearchSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchCleared: boolean;
  setIsSearchCleared: React.Dispatch<React.SetStateAction<boolean>>;
  searchLng: number;
  setSearchLng: React.Dispatch<React.SetStateAction<number>>;
  searchLat: number;
  setSearchLat: React.Dispatch<React.SetStateAction<number>>;
  /** Resolves to an error message to show, or null on success. */
  handleSearchSubmit: (searchQuery: string) => Promise<string | null>;
  handleSearchClear: () => void;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoom: number;
  isPostcode: (input: string) => boolean;
  calculateDistance: typeof calculateDistance;
  setLng: React.Dispatch<React.SetStateAction<number>>;
  lng: number;
  setLat: React.Dispatch<React.SetStateAction<number>>;
  lat: number;
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
}

interface SearchProviderProps {
  children: ReactNode;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState<string>('');
  const [searchSubmitted, setSearchSubmitted] = useState<boolean>(false);
  const [isSearchCleared, setIsSearchCleared] = useState<boolean>(false);
  const [searchLng, setSearchLng] = useState<number>(0);
  const [searchLat, setSearchLat] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(determineZoomLevel());
  const [lng, setLng] = useState<number>(-3.5);
  const [lat, setLat] = useState<number>(54.5);
  const [radius, setRadius] = useState<number>(10);

  const handleSearchSubmit = async (
    searchQuery: string
  ): Promise<string | null> => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return 'Please enter a search query.';

    if (isPartialPostcode(trimmedQuery)) {
      return 'Please enter a full postcode, for example BD1 4PS.';
    }

    if (isPostcode(trimmedQuery)) {
      const result = await lookupPostcode(trimmedQuery);
      if (result.status === 'not_found') {
        return `We couldn't find the postcode "${trimmedQuery}". Check it and try again.`;
      }
      if (result.status === 'error') {
        return "We couldn't look up that postcode just now. Check your connection and try again.";
      }
      setSearchLng(result.longitude);
      setSearchLat(result.latitude);
      setZoom(10);
      setSubmittedSearchQuery(result.postcode);
      setSearchSubmitted(true);
      setIsSearchCleared(false);
      return null;
    }

    setSubmittedSearchQuery(trimmedQuery);
    setSearchSubmitted(true);
    return null;
  };

  const handleSearchClear = (): void => {
    setLng(-3.5);
    setLat(54.5);
    setZoom(determineZoomLevel());
    setSearchInput('');
    setSubmittedSearchQuery('');
    setSearchSubmitted(false);
    setIsSearchCleared(true);
    setRadius(10);
  };

  const value: SearchContextType = {
    searchInput,
    setSearchInput,
    submittedSearchQuery,
    setSubmittedSearchQuery,
    searchSubmitted,
    setSearchSubmitted,
    isSearchCleared,
    setIsSearchCleared,
    searchLng,
    setSearchLng,
    searchLat,
    setSearchLat,
    handleSearchSubmit,
    handleSearchClear,
    setZoom,
    zoom,
    isPostcode,
    calculateDistance,
    setLng,
    lng,
    setLat,
    lat,
    radius,
    setRadius,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
