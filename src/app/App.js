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
import { calculateDistance, fetchCoordinates, determineZoomLevel } from './utils';


const Home = ({ serverAirtableData, initialServiceTypes, initialSpecialisms }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [serviceTypes] = useState(initialServiceTypes);
  const [specialisms] = useState(initialSpecialisms);
  const [lng, setLng] = useState(-3.5);
  const [lat, setLat] = useState(54.5);
  const [searchLng, setSearchlng] = useState('');
  const [searchLat, setSearchLat] = useState('');
  const [zoom, setZoom] = useState(determineZoomLevel());
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);
  const [isSearchCleared, setIsSearchCleared] = useState(false);
  const [filteredMapBoxData, setFilteredMapBoxData] = useState(serverAirtableData);

  const isPostcode = (input) => {
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
    return postcodeRegex.test(input.trim());
  };

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

    if (selectedServiceType) {
      result = result.filter(item => {
        const serviceType = item.properties?.serviceType || item['Service type'];
        return Array.isArray(serviceType) ? serviceType.includes(selectedServiceType) : serviceType === selectedServiceType;
      });
    }

    if (selectedSpecialisms.length > 0) {
      result = result.filter(item => {
        const itemSpecialisms = item.properties?.serviceSpecialism || item['Specialist services for'];
        return selectedSpecialisms.some(specialism => {
          if (Array.isArray(itemSpecialisms)) {
            return itemSpecialisms.includes(specialism);
          } else {
            return itemSpecialisms === specialism;
          }
        });
      });
    }

    if (searchSubmitted && !isPostcode(submittedSearchQuery)) {
      const searchQueryLower = submittedSearchQuery.toLowerCase();
      result = result.filter(item => {
        const name = item.properties?.name || item['Name'];
        return name && name.toLowerCase().includes(searchQueryLower);
      });
    }

    setFilteredData(result);
    setFilteredMapBoxData({ type: 'FeatureCollection', features: result });
  }, [selectedServiceType, selectedSpecialisms, searchSubmitted, submittedSearchQuery, serverAirtableData]);

  const handleSearchSubmit = async (searchQuery) => {
    if (!searchQuery) return;

    const trimmedQuery = searchQuery.trim();

    if (isPostcode(trimmedQuery)) {
      const coordinates = await fetchCoordinates(trimmedQuery);
      if (coordinates) {
        setSearchlng(coordinates.longitude);
        setSearchLat(coordinates.latitude);
        setZoom(10);
        setSubmittedSearchQuery(trimmedQuery);
        setSearchSubmitted(true);
        updateURLParams(trimmedQuery);
        setIsSearchCleared(false);
      }
    } else {
      setSubmittedSearchQuery(trimmedQuery);
      setSearchSubmitted(true);
      updateURLParams(trimmedQuery);
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

      servicesWithDistance = servicesWithDistance.filter(item => item !== null && item.distance <= 10);
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
          setSearchLng={setSearchlng}
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