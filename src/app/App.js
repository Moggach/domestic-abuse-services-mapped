'use client';

import React, { useState, useEffect } from 'react';
import MapBox from './components/MapBox';
import SearchInput from './components/SearchInput';
import GoToGoogleButton from './components/QuickExit';
import Banner from './components/Banner';
import Footer from './components/Footer';
import ServiceTypeFilter from './components/ServiceTypeFilter';
import SpecialismCheckboxes from './components/SpecialismCheckboxes';
import externalLinkIcon from './images/svgs/exernal_link.svg';
import { calculateDistance } from './utils';
import {
  AppContainer,
  ContentContainer,
  MapContainer,
  DataContainer,
  Inputs,
  ServiceItem,
  TagsContainer,
  CSVData
} from './styles/LayoutStyles';

const fetchCoordinates = async (postcode) => {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    const data = await response.json();
    if (data.status === 200) {
      const { latitude, longitude } = data.result;
      return { latitude, longitude };
    } else {
      console.error('Invalid postcode');
      return null;
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

const Home = ({ serverAirtableData, initialServiceTypes, initialSpecialisms }) => {

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

  const [filteredMapBoxData, setFilteredMapBoxData] = useState(serverAirtableData);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const toggleBannerVisibility = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  useEffect(() => {
    let result = serverAirtableData.features; 
    if (selectedServiceType) {
       result = result.filter(item => {
        const serviceType = item.properties.serviceType;
        return Array.isArray(serviceType) ? serviceType.includes(selectedServiceType) : serviceType === selectedServiceType;
      });
    }

    if (selectedSpecialisms.length > 0) {
      result = result.filter(item => {
        const itemSpecialisms = item.properties.serviceSpecialism;
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

  const handleSearchSubmit = async () => {
    if (!searchInput) return;
    const coordinates = await fetchCoordinates(searchInput);
    if (coordinates) {
      setSearchlng(coordinates.longitude);
      setSearchLat(coordinates.latitude);
      setZoom(10);
      setSubmittedSearchQuery(searchInput);
      setSearchSubmitted(true);
    }
  };

  const handleSearchClear = () => {
    setLng(-3.5);
    setLat(54.5);
    setZoom(5);
    setSearchInput('');
    setSubmittedSearchQuery('');
    setSearchSubmitted(false);
  };

  useEffect(() => {
    const updateAirtableDataWithDistance = () => {
      if (!searchLat || !searchLng) return;

      let servicesWithDistance = filteredData.map((item) => {
        const { coordinates } = item.geometry;
        if (coordinates && coordinates.length === 2) {
          const distance = calculateDistance(searchLat, searchLng, coordinates[1], coordinates[0]); // Assuming coordinates are [longitude, latitude]
          return { ...item, distance };
        }
        return null;
      });

      servicesWithDistance = servicesWithDistance.filter(item => item !== null && item.distance <= 10);
      servicesWithDistance.sort((a, b) => a.distance - b.distance);

      setFilteredDataWithDistance(servicesWithDistance.slice(0, 10));
    };

    updateAirtableDataWithDistance();
  }, [searchLat, searchLng, filteredData, setFilteredDataWithDistance]);

  return (
    <>
      <AppContainer>
        {isBannerVisible && <Banner onClose={toggleBannerVisibility} />}
        {!isBannerVisible && <GoToGoogleButton />}
        <ContentContainer>
          <MapContainer>
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
          </MapContainer>

          <DataContainer>
            <Inputs $isVisible={isFiltersVisible}>
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
                onSubmit={handleSearchSubmit}
                onClear={handleSearchClear}
              />
            </Inputs>
            <button onClick={toggleFiltersVisibility} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '11' }}>
              {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
            </button>

            <CSVData>
              {searchSubmitted && (
                <>
                  {filteredDataWithDistance.length > 0 ? (
                    <h2>Showing services within 10 miles of {submittedSearchQuery}:</h2>
                  ) : (
                    <h2>No search results within 10 miles of {submittedSearchQuery}. Try another search?</h2>
                  )}
                </>
              )}

              <ul>
                {(filteredDataWithDistance.length > 0 ? filteredDataWithDistance : serverAirtableData.features).map((item, index) => (
                  <ServiceItem key={index}>
                    <h3>{item.properties.name}</h3>
                    <p>{item.properties.address}</p>
                    <TagsContainer>
                      <p>
                        {Array.isArray(item.properties.serviceType)
                          ? item.properties.serviceType.join(' • ')
                          : item.properties.serviceType}
                      </p>
                      {item.properties.serviceType && item.properties.serviceSpecialism && <span> • </span>}
                      <p>{item.properties.serviceSpecialism}</p>
                    </TagsContainer>
                    <a href={item.properties.website}><img alt="an SVG icon indicating an external link" src={externalLinkIcon.src} style={{ width: '20px' }}></img></a>
                  </ServiceItem>
                ))}
              </ul>
            </CSVData>
          </DataContainer>
        </ContentContainer>
      </AppContainer>
      <Footer />
    </>
  );
};

export default Home;
