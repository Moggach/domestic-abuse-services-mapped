'use client';

import React, { useState } from 'react';

import Footer from './components/Footer';
import MapBox from './components/MapBox';
import Modal from './components/Modal';
import PaginatedList from './components/PaginatedList';
import QuickExit from './components/QuickExit';
import SearchInput from './components/SearchInput';
import ServiceTypeFilter from './components/ServiceTypeFilter';
import SpecialismCheckboxes from './components/SpecialismCheckboxes';
import { useSearch } from './contexts/SearchContext';
import { useMapData } from './hooks/useMapData';
import { useSearchFilters } from './hooks/useSearchFilters';
import { useURLParams } from './hooks/useUrlParams';

const Home = ({
  serverAirtableData,
  initialServiceTypes,
  initialSpecialisms,
}) => {
  const {
    searchInput,
    setSearchInput,
    submittedSearchQuery,
    handleSearchSubmit,
    handleSearchClear,
    searchLng,
    setSearchLng,
    searchLat,
    setSearchLat,
    searchSubmitted,
    isSearchCleared,
    zoom,
    setZoom,
    isPostcode,
    calculateDistance,
    lng,
    lat,
    setLng,
    setLat,
  } = useSearch();

  const {
    selectedServiceType,
    setSelectedServiceType,
    selectedSpecialisms,
    setSelectedSpecialisms,
    filteredData,
    filteredDataWithDistance,
  } = useSearchFilters(
    serverAirtableData,
    isPostcode,
    submittedSearchQuery,
    searchSubmitted
  );

  const [serviceTypes] = useState(initialServiceTypes);
  const [specialisms] = useState(initialSpecialisms);
  const { filteredMapBoxData } = useMapData(
    filteredData,
    searchLat,
    searchLng,
    isSearchCleared,
    calculateDistance
  );
  const [currentPage, setCurrentPage] = useState(1);

  useURLParams(
    selectedServiceType,
    selectedSpecialisms,
    submittedSearchQuery,
    currentPage
  );

  return (
    <>
      <main className="p-4 lg:flex lg:flex-row-reverse lg:gap-6">
        <Modal />
        <MapBox
          lng={lng}
          lat={lat}
          zoom={zoom}
          data={filteredMapBoxData}
          setLng={setLng}
          setLat={setLat}
          setZoom={setZoom}
          setSearchLng={setSearchLng}
          setSearchLat={setSearchLat}
          searchLng={searchLng}
          searchLat={searchLat}
        />

        <div className="flex flex-col gap-5 basis-1/2">
          <ServiceTypeFilter
            selectedServiceType={selectedServiceType}
            setSelectedServiceType={setSelectedServiceType}
            serviceTypes={serviceTypes}
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
          {searchSubmitted && (
            <div className="mt-2">
              {isPostcode(submittedSearchQuery) ? (
                filteredDataWithDistance.length > 0 ? (
                  <h2>
                    Showing services within 10 miles of {submittedSearchQuery}:
                  </h2>
                ) : (
                  <h2>
                    No search results within 10 miles of {submittedSearchQuery}.
                    Try another search?
                  </h2>
                )
              ) : filteredData.length > 0 ? (
                <h2>Showing services matching "{submittedSearchQuery}":</h2>
              ) : (
                <h2>
                  No services found matching "{submittedSearchQuery}". Try
                  another search?
                </h2>
              )}
            </div>
          )}
          <PaginatedList
            data={
              isPostcode(submittedSearchQuery)
                ? filteredDataWithDistance
                : filteredData
            }
            itemsPerPage={10}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </main>
      <QuickExit />
      <Footer />
    </>
  );
};

export default Home;
