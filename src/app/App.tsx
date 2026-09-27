'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import Footer from './components/Footer';
import LocalAuthorityFilter from './components/LocalAuthorityFilter';
import Modal from './components/Modal';
import NavBar from './components/NavBar';
import PaginatedList from './components/PaginatedList';
import QuickExit from './components/QuickExit';
import RadiusSlider from './components/RadiusSlider';
import SearchInput from './components/SearchInput';
import ServiceTypeFilter from './components/ServiceTypeFilter';
import SpecialismCheckboxes from './components/SpecialismCheckboxes';
import { useSearch } from './contexts/SearchContext';
import { useMapData } from './hooks/useMapData';
import { useSearchFilters } from './hooks/useSearchFilters';
import { useURLParams } from './hooks/useUrlParams';
import type { HomePageProps } from './types';

// Mapbox is ~1.2 MB of JavaScript. Loading it separately means the rest of
// the page (search, filters, pagination, Safe exit) works without waiting
// for it on slow phones.
const MapBox = dynamic(() => import('./components/MapBox'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[400px] w-full lg:h-[800px] rounded-2xl bg-base-200"
      role="status"
    >
      <span className="sr-only">Loading map…</span>
    </div>
  ),
});

const App: React.FC<HomePageProps> = ({
  serverData,
  initialServiceTypes,
  initialSpecialisms,
  localAuthorities,
}) => {
  const {
    searchInput,
    setSearchInput,
    submittedSearchQuery,
    handleSearchSubmit,
    handleSearchClear,
    searchLng,
    searchLat,
    searchSubmitted,
    isSearchCleared,
    zoom,
    isPostcode,
    calculateDistance,
    lng,
    lat,
    setLng,
    setLat,
    radius,
    setRadius,
  } = useSearch();

  const {
    selectedServiceType,
    setSelectedServiceType,
    selectedLocalAuthority,
    setSelectedLocalAuthority,
    selectedSpecialisms,
    setSelectedSpecialisms,
    filteredData,
  } = useSearchFilters(
    serverData,
    isPostcode,
    submittedSearchQuery,
    searchSubmitted
  );

  const [serviceTypes] = useState<string[]>(initialServiceTypes);
  const [specialisms] = useState<string[]>(initialSpecialisms);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const { filteredMapBoxData, filteredDataWithDistance } = useMapData(
    filteredData,
    searchLat,
    searchLng,
    isSearchCleared,
    calculateDistance,
    radius
  );

  useURLParams(
    selectedServiceType,
    selectedLocalAuthority,
    selectedSpecialisms,
    submittedSearchQuery,
    currentPage
  );

  const hasFiltersApplied =
    selectedServiceType !== '' ||
    selectedLocalAuthority !== '' ||
    selectedSpecialisms.length > 0 ||
    submittedSearchQuery !== '';

  const clearFilters = () => {
    setSelectedServiceType('');
    setSelectedLocalAuthority('');
    setSelectedSpecialisms([]);
    handleSearchClear();
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      <NavBar onClearFilters={clearFilters} />
      {/* Grid so the search sits above the map on mobile, while on desktop
          the map fills the left column beside the search and results. */}
      <main
        id="main-content"
        className="px-4 pt-8 pb-8 grid gap-7 lg:grid-cols-2 lg:gap-x-6"
      >
        <Modal />
        <div className="flex flex-col gap-7 lg:col-start-2 lg:row-start-1">
          <SearchInput
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
            onSubmit={() => handleSearchSubmit(searchInput)}
            onClear={handleSearchClear}
          />
          {isPostcode(submittedSearchQuery) && (
            <RadiusSlider
              radius={radius}
              setRadius={setRadius}
              min={1}
              max={10}
            />
          )}
        </div>

        <div className="relative self-start lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-8">
          <MapBox
            lng={lng}
            lat={lat}
            zoom={zoom}
            data={
              filteredMapBoxData || { type: 'FeatureCollection', features: [] }
            }
            setLng={setLng}
            setLat={setLat}
            searchLng={searchLng}
            searchLat={searchLat}
            selectedLocalAuthority={selectedLocalAuthority}
            setIsMapLoading={setIsMapLoading}
            isMapLoading={isMapLoading}
          />
        </div>

        <div className="flex flex-col gap-7 lg:col-start-2 lg:row-start-2">
          <ServiceTypeFilter
            selectedServiceType={selectedServiceType}
            setSelectedServiceType={setSelectedServiceType}
            serviceTypes={serviceTypes}
          />
          <LocalAuthorityFilter
            selectedLocalAuthority={selectedLocalAuthority}
            setSelectedLocalAuthority={setSelectedLocalAuthority}
            localAuthorities={localAuthorities}
          />
          <SpecialismCheckboxes
            specialisms={specialisms}
            selectedSpecialisms={selectedSpecialisms}
            setSelectedSpecialisms={setSelectedSpecialisms}
          />
          <PaginatedList
            data={
              isPostcode(submittedSearchQuery)
                ? filteredDataWithDistance
                : filteredData
            }
            itemsPerPage={10}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            searchSubmitted={searchSubmitted}
            submittedSearchQuery={submittedSearchQuery}
            isPostcode={isPostcode}
            radius={radius}
            hasFiltersApplied={hasFiltersApplied}
            onClearFilters={clearFilters}
          />
        </div>
      </main>
      <QuickExit />
      <Footer />
    </>
  );
};

export default App;
