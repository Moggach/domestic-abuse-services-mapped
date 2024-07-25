'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapBox from './components/MapBox';
import SearchInput from './components/SearchInput';
import QuickExit from './components/QuickExit';
import Banner from './components/Banner';
import Footer from './components/Footer';
import ServiceTypeFilter from './components/ServiceTypeFilter';
import SpecialismCheckboxes from './components/SpecialismCheckboxes';
import externalLinkIcon from './images/svgs/exernal_link.svg';
import { calculateDistance, fetchCoordinates } from './utils';

const Home = ({ serverAirtableData, initialServiceTypes, initialSpecialisms }) => {
  const router = useRouter();
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [serviceTypes] = useState(initialServiceTypes);
  const [specialisms] = useState(initialSpecialisms);
  const [lng, setLng] = useState(-3.5);
  const [lat, setLat] = useState(54.5);
  const [searchLng, setSearchlng] = useState('');
  const [searchLat, setSearchLat] = useState('');
  const [zoom, setZoom] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);
  const [isSearchCleared, setIsSearchCleared] = useState(false);

  const [filteredMapBoxData, setFilteredMapBoxData] = useState(serverAirtableData);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

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

  const toggleBannerVisibility = () => {
    setIsBannerVisible(!isBannerVisible);
  };

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

    router.replace(`/?${params.toString()}`, { shallow: true });
  };

  useEffect(() => {
    updateURLParams(submittedSearchQuery);
  }, [selectedServiceType, selectedSpecialisms, submittedSearchQuery]);

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

    setFilteredData(result);
    setFilteredMapBoxData({ type: 'FeatureCollection', features: result });
  }, [selectedServiceType, selectedSpecialisms, serverAirtableData]);

  const handleSearchSubmit = async (searchQuery) => {
    if (!searchQuery) return;
    const coordinates = await fetchCoordinates(searchQuery);
    if (coordinates) {
      setSearchlng(coordinates.longitude);
      setSearchLat(coordinates.latitude);
      setZoom(10);
      setSubmittedSearchQuery(searchQuery);
      setSearchSubmitted(true);
      updateURLParams(searchQuery);
      setIsSearchCleared(false);
    }
  };

  const handleSearchClear = () => {
    setLng(-3.5);
    setLat(54.5);
    setZoom(5);
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
      <main className="bg-slate-300 p-4 lg:flex lg:flex-row-reverse lg:gap-6">
        <QuickExit/>
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

        <div className='flex flex-col gap-5'>
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
            <div className='mt-2'>
              {filteredDataWithDistance.length > 0 ? (
                <h2>Showing services within 10 miles of {submittedSearchQuery}:</h2>
              ) : (
                <h2>No search results within 10 miles of {submittedSearchQuery}. Try another search?</h2>
              )}
            </div>
          )}
          <ul className="flex flex-col gap-4 mt-6">
            {searchSubmitted ? (
              filteredDataWithDistance.length > 0 ? filteredDataWithDistance.map((item, index) => {
                const properties = item.properties;
                return (
                  <div className="card bg-base-100 w-full shadow-xl" key={index}>
                    <div className="card-body">
                      <h3 className="card-title">{properties.name}</h3>
                      <div className="card-actions justify-end"></div>
                      <p>{properties.address}</p>
                      <div>
                        <p>
                          {Array.isArray(properties.serviceType)
                            ? properties.serviceType.join(' • ')
                            : properties.serviceType}
                        </p>
                        {properties.serviceType && properties.serviceSpecialism && <span> • </span>}
                        <p>{properties.serviceSpecialism}</p>
                      </div>
                      <a href={properties.website}>
                        <img
                          alt="an SVG icon indicating an external link"
                          src={externalLinkIcon.src}
                          style={{ width: '20px' }}
                        />
                      </a>
                    </div>
                  </div>
                );
              }) : <li>No services found within the specified distance.</li>
            ) : (
              filteredData.map((item, index) => {
                const properties = item.properties;
                return (
                  <div className="card bg-base-100 w-full shadow-xl" key={index}>
                    <div className="card-body">
                      <h3 className="card-title">{properties.name}</h3>
                      <div className="card-actions justify-end"></div>
                      <p>{properties.address}</p>
                      <div>
                        <p>
                          {Array.isArray(properties.serviceType)
                            ? properties.serviceType.join(' • ')
                            : properties.serviceType}
                        </p>
                        {properties.serviceType && properties.serviceSpecialism && <span> • </span>}
                        <p>{properties.serviceSpecialism}</p>
                      </div>
                      <a href={properties.website}>
                        <img
                          alt="an SVG icon indicating an external link"
                          src={externalLinkIcon.src}
                          style={{ width: '20px' }}
                        />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;
