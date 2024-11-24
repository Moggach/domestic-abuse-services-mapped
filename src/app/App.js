'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapBox from './components/MapBox';
import SearchInput from './components/SearchInput';
import QuickExit from './components/QuickExit';
import Modal from './components/Modal';
import Footer from './components/Footer';
import ServiceTypeFilter from './components/ServiceTypeFilter';
import SpecialismCheckboxes from './components/SpecialismCheckboxes';
import PaginatedList from './components/PaginatedList';
import { useSearch } from './contexts/SearchContext';
import { filterByServiceType, filterBySpecialisms } from './/utils';


const Home = ({ serverAirtableData, initialServiceTypes, initialSpecialisms }) => {
  const router = useRouter();
  const {
    searchInput,
    setSearchInput,
    submittedSearchQuery,
    handleSearchSubmit,
    handleSearchClear,
    filteredData,
    setFilteredData,
    filteredDataWithDistance,
    setFilteredDataWithDistance,
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
    setLat
  } = useSearch();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [serviceTypes] = useState(initialServiceTypes);
  const [specialisms] = useState(initialSpecialisms);
  const [filteredMapBoxData, setFilteredMapBoxData] = useState(serverAirtableData);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const serviceType = params.get('serviceType');
    const specialisms = params.get('specialisms');
    const searchQuery = params.get('search');

    if (serviceType) {
      setSelectedServiceType(serviceType);
    }

    if (specialisms) {
      setSelectedSpecialisms(specialisms.split(','));
    }

    if (searchQuery) {
      setSearchInput(searchQuery);
      handleSearchSubmit(searchQuery);
    }
  }, []);

  const updateURLParams = (searchQuery) => {
    const params = new URLSearchParams();

    if (selectedServiceType) {
      params.set('serviceType', selectedServiceType);
    }

    if (selectedSpecialisms.length > 0) {
      params.set('specialisms', selectedSpecialisms.join(','));
    }

    if (searchQuery) {
      params.set('search', searchQuery);
    }

    if (currentPage) {
      params.set('page', currentPage);
    }

    router.replace(`/?${params.toString()}`, { shallow: true });
  };

  useEffect(() => {
    updateURLParams(submittedSearchQuery);
  }, [selectedServiceType, selectedSpecialisms, submittedSearchQuery, currentPage]);

  useEffect(() => {
    let result = serverAirtableData.features;

    // Use utility functions for filtering
    result = filterByServiceType(result, selectedServiceType);
    result = filterBySpecialisms(result, selectedSpecialisms);

    if (searchSubmitted && !isPostcode(submittedSearchQuery)) {
      const searchQueryLower = submittedSearchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = item.properties?.name || item['Name'];
        return name && name.toLowerCase().includes(searchQueryLower);
      });
    }

    setFilteredData(result);
    setFilteredMapBoxData({ type: 'FeatureCollection', features: result });
  }, [selectedServiceType, selectedSpecialisms, searchSubmitted, submittedSearchQuery, serverAirtableData]);

  useEffect(() => {
    const updateAirtableDataWithDistance = () => {
      if (isSearchCleared) return;

      let servicesWithDistance = filteredData.map((item) => {
        const { coordinates } = item.geometry;
        if (coordinates && coordinates.length === 2) {
          const distance = calculateDistance(searchLat, searchLng, coordinates[1], coordinates[0]);
          return { ...item, distance };
        }
        return null;
      });

      servicesWithDistance = servicesWithDistance.filter((item) => item !== null && item.distance <= 10);
      servicesWithDistance.sort((a, b) => a.distance - b.distance);
      setFilteredDataWithDistance(servicesWithDistance.slice(0, 10));
    };

    updateAirtableDataWithDistance();
  }, [searchLat, searchLng, filteredData]);

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

        <div className='flex flex-col gap-5 basis-1/2'>
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
                  <h2>Showing services within 10 miles of {submittedSearchQuery}:</h2>
                ) : (
                  <h2>No search results within 10 miles of {submittedSearchQuery}. Try another search?</h2>
                )
              ) : (
                filteredData.length > 0 ? (
                  <h2>Showing services matching "{submittedSearchQuery}":</h2>
                ) : (
                  <h2>No services found matching "{submittedSearchQuery}". Try another search?</h2>
                )
              )}
            </div>
          )}
          <PaginatedList
            data={isPostcode(submittedSearchQuery) ? filteredDataWithDistance : filteredData}
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