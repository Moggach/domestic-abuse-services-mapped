'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MapBox from './components/MapBox';
import SearchInput from './components/SearchInput';
import GoToGoogleButton from './components/QuickExit';
import Banner from './components/Banner';
import Footer from './components/Footer';
import ServiceTypeFilter from './components/ServiceTypeFilter';
import SpecialismCheckboxes from './components/SpecialismCheckboxes';
import externalLinkIcon from './images/svgs/exernal_link.svg';
import { calculateDistance } from './utils';
import { fetchCoordinates } from './api/geojson/route';
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
const Home = ({ serverAirtableData, initialServiceTypes, initialSpecialisms }) => {
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [serviceTypes, setServiceTypes] = useState(initialServiceTypes);
  const [specialisms, setSpecialisms] = useState(initialSpecialisms);
  const [lng, setLng] = useState(-3.5);
  const [lat, setLat] = useState(54.5);
  const [searchLng, setSearchlng] = useState('');
  const [searchLat, setSearchLat] = useState('');
  const [zoom, setZoom] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [airtableData, setAirtableData] = useState(serverAirtableData || []);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [geoJsonData, setGeoJsonData] = useState({
    type: "FeatureCollection",
    features: []
  });

  const toggleBannerVisibility = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const generateGeoJsonData = useCallback(async (data) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/geojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    const geoJsonData = await response.json();
    setGeoJsonData(geoJsonData);
    return geoJsonData;
  }, [setGeoJsonData]);

  const updateFilteredData = useCallback((data) => {
    setFilteredData(data);
    generateGeoJsonData(data).then(geoData => {
      setGeoJsonData(geoData);
    });
  }, [generateGeoJsonData, setGeoJsonData]);

  useEffect(() => {
    if (serverAirtableData.length > 0) {
      setAirtableData(serverAirtableData);
      updateFilteredData(serverAirtableData);
    }
  }, [serverAirtableData, updateFilteredData]);

  useEffect(() => {
    if (filteredData.length > 0) {
      updateFilteredData(filteredData);
    }
  }, [filteredData, updateFilteredData]);

  useEffect(() => {
    let result = airtableData;

    if (selectedServiceType) {
      result = result.filter(item => {
        const serviceType = item['Service type'];
        return Array.isArray(serviceType) ? serviceType.includes(selectedServiceType) : serviceType === selectedServiceType;
      });
    }

    if (selectedSpecialisms.length > 0) {
      result = result.filter(item => {
        const itemSpecialisms = item['Specialist services for'];
        return selectedSpecialisms.some(specialism => {
          if (Array.isArray(itemSpecialisms)) {
            return itemSpecialisms.includes(specialism);
          } else {
            return itemSpecialisms === specialism;
          }
        });
      });
    }

    updateFilteredData(result);
  }, [selectedServiceType, selectedSpecialisms, airtableData, updateFilteredData]);

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
    const updateAirtableDataWithDistance = async () => {
      if (!searchLat || !searchLng) return;

      let servicesWithDistance = await Promise.all(filteredData.map(async (item) => {
        const coordinates = await fetchCoordinates(item["Service postcode"]);
        if (coordinates) {
          const distance = calculateDistance(searchLat, searchLng, coordinates.latitude, coordinates.longitude);
          return { ...item, distance };
        }
        return null;
      }));

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
              data={geoJsonData}
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
            <button onClick={toggleFiltersVisibility} style={{ 'position': 'absolute', 'top': '10px', 'left': '10px', 'zIndex': '11' }}>
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
                {(searchSubmitted ? filteredDataWithDistance : filteredData).map((item, index) => (
                  <ServiceItem key={index}>
                    <h3>{item["Service name"]}</h3>
                    <p>{item["Service address"]}</p>
                    <TagsContainer>
                      <p>
                        {Array.isArray(item["Service type"])
                          ? item["Service type"].join(' • ')
                          : item["Service type"]}
                      </p>
                      {item["Service type"] && item["Specialist services for"] && <span> • </span>}
                      <p>{item["Specialist services for"]}</p>
                    </TagsContainer>
                    <a href={item["Service website"]}><img alt="an SVG icon indicating an external link" src={externalLinkIcon.src} style={{ width: '20px' }}></img></a>
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