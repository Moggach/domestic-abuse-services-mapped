'use client';
import type { ReactNode } from 'react';
import React, { createContext, useState, useContext } from 'react';

import type { Feature } from '../App';
import {
  calculateDistance,
  fetchCoordinates,
  determineZoomLevel,
} from '../utils';


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
  filteredData: Feature[];
  setFilteredData: React.Dispatch<React.SetStateAction<Feature[]>>;
  filteredDataWithDistance: Feature[];
  setFilteredDataWithDistance: React.Dispatch<React.SetStateAction<Feature[]>>;
  handleSearchSubmit: (searchQuery: string) => Promise<void>;
  handleSearchClear: () => void;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoom: number;
  isPostcode: (input: string) => boolean;
  calculateDistance: typeof calculateDistance;
  setLng: React.Dispatch<React.SetStateAction<number>>;
  lng: number;
  setLat: React.Dispatch<React.SetStateAction<number>>;
  lat: number;
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
  const [filteredData, setFilteredData] = useState<Feature[]>([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState<
    Feature[]
  >([]);
  const [zoom, setZoom] = useState<number>(determineZoomLevel());
  const [lng, setLng] = useState<number>(-3.5);
  const [lat, setLat] = useState<number>(54.5);

  const isPostcode = (input: string): boolean => {
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    return postcodeRegex.test(input.trim());
  };

  const handleSearchSubmit = async (searchQuery: string): Promise<void> => {
    if (!searchQuery) return;

    const trimmedQuery = searchQuery.trim();

    if (isPostcode(trimmedQuery)) {
      const coordinates = await fetchCoordinates(trimmedQuery);
      if (coordinates) {
        setSearchLng(coordinates.longitude);
        setSearchLat(coordinates.latitude);
        setZoom(10);
        setSubmittedSearchQuery(trimmedQuery);
        setSearchSubmitted(true);
        setIsSearchCleared(false);
      }
    } else {
      setSubmittedSearchQuery(trimmedQuery);
      setSearchSubmitted(true);
    }
  };

  const handleSearchClear = (): void => {
    setLng(-3.5);
    setLat(54.5);
    setZoom(determineZoomLevel());
    setSearchInput('');
    setSubmittedSearchQuery('');
    setSearchSubmitted(false);
    setFilteredDataWithDistance([]);
    setIsSearchCleared(true);
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
    filteredData,
    setFilteredData,
    filteredDataWithDistance,
    setFilteredDataWithDistance,
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
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
