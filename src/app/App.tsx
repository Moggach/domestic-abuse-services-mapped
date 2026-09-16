'use client';

import React, { useState } from 'react';

import ClearFiltersButton from './components/ClearFiltersButton';
import Footer from './components/Footer';
import LocalAuthorityFilter from './components/LocalAuthorityFilter';
import MapBox from './components/MapBox';
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
      <main id="main-content" className="px-4 pt-8 pb-8 lg:flex lg:gap-6">
        <Modal />
        <div className="lg:basis-1/2 lg:sticky lg:top-8 self-start h-fit mb-8 lg:mb-0">
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

        <div className="flex flex-col gap-7 basis-1/2">
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
          {hasFiltersApplied && <ClearFiltersButton onClear={clearFilters} />}
          <PaginatedList
            data={
              isPostcode(submittedSearchQuery)
                ? filteredDataWithDistance
                : filteredData
            }
            filteredData={filteredData}
            filteredDataWithDistance={filteredDataWithDistance}
            itemsPerPage={10}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isMapLoading={isMapLoading}
            searchSubmitted={searchSubmitted}
            submittedSearchQuery={submittedSearchQuery}
            isPostcode={isPostcode}
            radius={radius}
          />
        </div>
      </main>
      <QuickExit />
      <Footer />
    </>
  );
};

export default App;
