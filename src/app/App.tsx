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

interface Geometry {
  type: 'Point';
  coordinates: [number, number];
}

interface Properties {
  name: string;
  description: string;
  address: string;
  postcode: string;
  email: string;
  website: string;
  phone: string;
  donate?: string;
  serviceType: string[];
  serviceSpecialism: string[];
  approved: boolean;
}

interface Feature {
  type: 'Feature';
  properties: Properties;
  geometry: Geometry;
}

interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

interface HomePageProps {
  serverAirtableData: FeatureCollection;
  initialServiceTypes: string[];
  initialSpecialisms: string[];
}

const Home: React.FC<HomePageProps> = ({
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
  } = useSearchFilters(
    serverAirtableData,
    isPostcode,
    submittedSearchQuery,
    searchSubmitted
  );

  const [serviceTypes] = useState<string[]>(initialServiceTypes);
  const [specialisms] = useState<string[]>(initialSpecialisms);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { filteredMapBoxData, filteredDataWithDistance } = useMapData(
    filteredData,
    searchLat,
    searchLng,
    isSearchCleared,
    calculateDistance
  );

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
                <h2>
                  Showing services matching &quot;{submittedSearchQuery}&quot;:
                </h2>
              ) : (
                <h2>
                  No services found matching &quot;{submittedSearchQuery}&quot;.
                  Try another search?
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
