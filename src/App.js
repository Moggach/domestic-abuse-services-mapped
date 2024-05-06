import React, { useState, useEffect } from 'react';
import MapBox from './ components/MapBox';
import SearchInput from './ components/SearchInput';
import GoToGoogleButton from './ components/QuickExit'
import Banner from './ components/Banner'
import { Helmet } from 'react-helmet';

import ServiceTypeFilter from './ components/ServiceTypeFilter';
import SpecialismCheckboxes from './ components/SpecialismCheckboxes';
import { useAirTableData } from './ components/useAirtableData';
import externalLinkIcon from './images/svgs/exernal_link.svg';
import { AppContainer, ContentContainer, MapContainer, DataContainer, Inputs, ServiceItem, TagsContainer, Footer, CSVData } from './styles/LayoutStyles';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance * 0.621371; // Convert to miles
}

async function fetchCoordinates(postcode, accessToken) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postcode)}.json?country=GB&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    const [longitude, latitude] = data.features[0].geometry.coordinates;
    return { longitude, latitude };

  } else {
    return null;
  }
}

export default function App() {
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [specialisms, setSpecialisms] = useState([]);
  const [lng, setLng] = useState(-3.5);
  const [lat, setLat] = useState(54.5);
  const [searchLng, setSearchlng] = useState('');
  const [searchLat, setSearchLat] = useState('');
  const [zoom, setZoom] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [airtableData] = useAirTableData();
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const toggleBannerVisibility = () => {
    setIsBannerVisible(!isBannerVisible);
  };

  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const [geoJsonData, setGeoJsonData] = useState({
    type: "FeatureCollection",
    features: []
  });

  const generateGeoJsonData = async (data) => {
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const featuresWithCoordinates = await Promise.all(data.map(async (item) => {
      const coordinates = await fetchCoordinates(item["Service postcode"], accessToken);
      if (coordinates) {
        return {
          type: "Feature",
          properties: {
            name: item["Service name"],
            address: item["Service address"],
            postcode: item["Service postcode"],
            email: item["Service email address"],
            website: item["Service website"],
            phone: item["Service phone number"],
            donate: item["Service donation link"],
            serviceType: item["Service type"],
            specialisms: item["Specialist services for"],
          },
          geometry: {
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude],
          }
        };
      } else {
        console.error('No coordinates for', item["Service postcode"]);
        return null;
      }
    }));

    return {
      type: "FeatureCollection",
      features: featuresWithCoordinates.filter(feature => feature !== null)
    };
  };

  useEffect(() => {
    if (airtableData.length > 0) {
      generateGeoJsonData(airtableData).then(setGeoJsonData);
    }
  }, [airtableData]);

  useEffect(() => {
    if (filteredData.length > 0) {
      generateGeoJsonData(filteredData).then(setGeoJsonData);
    }
  }, [filteredData]);

  useEffect(() => {
    const flattenAndUnique = (data) => {
      const allServiceTypes = data.reduce((acc, item) => {
        const serviceTypes = item['Service type'];
        if (Array.isArray(serviceTypes)) {
          acc.push(...serviceTypes);
        } else if (typeof serviceTypes === 'string') {
          acc.push(...serviceTypes.split(',').map(type => type.trim()));
        } else {
          acc.push(serviceTypes);
        }
        return acc;
      }, []);
      return [...new Set(allServiceTypes)].filter(Boolean);
    };

    const newServiceTypes = flattenAndUnique(airtableData);

    const flattenAndUniqueSpecialisms = (data) => {
      const allSpecialisms = data.reduce((acc, item) => {
        const specialisms = item['Specialist services for'];
        if (Array.isArray(specialisms)) {
          acc.push(...specialisms);
        } else if (typeof specialisms === 'string') {
          acc.push(...specialisms.split(',').map(specialism => specialism.trim()));
        } else {
          acc.push(specialisms);
        }
        return acc;
      }, []);

      return [...new Set(allSpecialisms)].filter(Boolean);
    };

    const newSpecialisms = flattenAndUniqueSpecialisms(airtableData);
    setServiceTypes(newServiceTypes);
    setSpecialisms(newSpecialisms);
  }, [airtableData]);

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

    setFilteredData(result);
  }, [selectedServiceType, selectedSpecialisms, airtableData]);

  const handleSearchSubmit = async () => {
    if (!searchInput) return;
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const coordinates = await fetchCoordinates(searchInput, accessToken);
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

      const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      let servicesWithDistance = await Promise.all(filteredData.map(async (item) => {
        const coordinates = await fetchCoordinates(item["Service postcode"], accessToken);
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
      <Helmet>
        <title>Domestic Abuse Services Mapped</title>
        <meta property="og:title" content="Domestic Abuse Services Mapped" />
        <meta property="og:description" content="A tool for mapping domestic abuse services across the UK." />
        <meta property="og:image" content="images/og_image.png" />
        <meta property="og:url" content="https://domesticabuseservices.uk" />
        <meta property="og:type" content="website" />
      </Helmet>
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
            <Inputs isVisible={isFiltersVisible}>

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
            <button onClick={toggleFiltersVisibility} style={{ 'position': 'absolute', 'top': '10px', 'left': '10px', 'z-index': '11' }}>
              {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
            </button>

            <CSVData>
              {searchSubmitted && (
                <>
                  {filteredDataWithDistance.length > 0 ? (
                    <h2>Showing services within 10 miles of {submittedSearchQuery}:</h2>
                  ) : (
                    <h2>No search results within 10 miles of {submittedSearchQuery} Try another search?</h2>
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
                    <a href={item["Service website"]}><img alt="an SVG icon indicating an external link" src={externalLinkIcon} style={{ width: '20px' }}></img></a>
                  </ServiceItem>
                ))}
              </ul>
            </CSVData>

          </DataContainer>
        </ContentContainer>
      </AppContainer>
      <Footer>
        <p>Made with ❤️ by <a href="https://github.com/Moggach">Moggach</a></p>
        <p>Service isn't listed? <a href="https://airtable.com/appksbQlVr07Kxadu/pagEkSrTVCs0yk2OS/form">Submit here</a></p>
      </Footer>
    </>
  );
}
