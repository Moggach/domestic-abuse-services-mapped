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
import externalLinkIcon from './images/svgs/exernal_link.svg';
import { calculateDistance, fetchCoordinates, colorMapping, determineZoomLevel } from './utils';


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
  const [zoom, setZoom] = useState(determineZoomLevel());
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);
  const [isSearchCleared, setIsSearchCleared] = useState(false);
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


  const getColorForBadge = (text) => {
    return colorMapping[text] || "bg-blue-400 text-white"; 
  };

  return (
    <>
      <main className="bg-base-200 p-4 lg:flex lg:flex-row-reverse lg:gap-6">
        <Modal/>
        <QuickExit />
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
              filteredDataWithDistance.length > 0 ? (
                filteredDataWithDistance.map((item, index) => {
                  const properties = item.properties;
                  return (
                    <div className="card bg-primary-content w-full shadow-xl" key={index}>
                      <div className="card-body">
                        <h3 className="card-title">{properties.name}</h3>
                        <div className="card-actions justify-end"></div>
                        <p>{properties.address}</p>
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(properties.serviceType)
                              ? properties.serviceType.map((type, i) => (
                                <div
                                  key={i}
                                  className={`badge ${getColorForBadge(type)} p-5 text-white`}
                                >
                                  {type}
                                </div>
                              ))
                              : <div className={`badge ${getColorForBadge(properties.serviceType)} p-5 text-white`}>{properties.serviceType}</div>}
                          </div>
                          {properties.serviceSpecialism && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Array.isArray(properties.serviceSpecialism)
                                ? properties.serviceSpecialism.map((spec, i) => (
                                  <div
                                    key={i}
                                    className={`badge ${getColorForBadge(spec)} p-5`}
                                  >
                                    {spec}
                                  </div>
                                ))
                                : <div className={`badge ${getColorForBadge(properties.serviceSpecialism)} p-5`}>{properties.serviceSpecialism}</div>}
                            </div>
                          )}
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
              ) : (
                <li>No services found within the specified distance.</li>
              )
            ) : (
              filteredData.map((item, index) => {
                const properties = item.properties;
                return (
                  <div className="card bg-primary-content w-full shadow-xl" key={index}>
                    <div className="card-body">
                      <div className='flex justify-between items-center'>
                        <h3 className="card-title">{properties.name}</h3>

                        <a href={properties.website}>
                          <img
                            alt="an SVG icon indicating an external link"
                            src={externalLinkIcon.src}
                            style={{ width: '20px' }}
                          />
                        </a>
                      </div>
                      <div className="card-actions justify-end"></div>
                      <p>{properties.address}</p>
                      <div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Array.isArray(properties.serviceType)
                            ? properties.serviceType.map((type, i) => (
                              <div
                                key={i}
                                className={`badge ${getColorForBadge(type)} p-5 text-white`}
                              >
                                {type}
                              </div>
                            ))
                            : <div className={`badge ${getColorForBadge(properties.serviceType)} p-5 text-white`}>{properties.serviceType}</div>}
                        </div>
                        {properties.serviceSpecialism && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Array.isArray(properties.serviceSpecialism)
                              ? properties.serviceSpecialism.map((spec, i) => (
                                <div
                                  key={i}
                                  className={`badge ${getColorForBadge(spec)} p-5`}
                                >
                                  {spec}
                                </div>
                              ))
                              : <div className={`badge ${getColorForBadge(properties.serviceSpecialism)} p-5`}>{properties.serviceSpecialism}</div>}
                          </div>
                        )}
                      </div>

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
