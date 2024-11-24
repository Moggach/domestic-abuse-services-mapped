'use client';
import React, { createContext, useState, useContext } from 'react';
import {
  calculateDistance,
  fetchCoordinates,
  determineZoomLevel,
} from '../utils';

const SearchContext = createContext();

export const useSearch = () => {
  return useContext(SearchContext);
};

export const SearchProvider = ({ children }) => {
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isSearchCleared, setIsSearchCleared] = useState(false);
  const [searchLng, setSearchLng] = useState('');
  const [searchLat, setSearchLat] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);
  const [zoom, setZoom] = useState(determineZoomLevel());
  const [lng, setLng] = useState(-3.5);
  const [lat, setLat] = useState(54.5);

  const isPostcode = (input) => {
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    return postcodeRegex.test(input.trim());
  };

  const handleSearchSubmit = async (searchQuery) => {
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

  const handleSearchClear = () => {
    setLng(-3.5);
    setLat(54.5);
    setZoom(determineZoomLevel());
    setSearchInput('');
    setSubmittedSearchQuery('');
    setSearchSubmitted(false);
    setFilteredDataWithDistance([]);
    setIsSearchCleared(true);
  };

  const value = {
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
