import React, { useState, useEffect } from 'react';
import MapBox from './ components/MapBox';
import SearchInput from './ components/SearchInput';
import Banner from './ components/Banner'
import ServiceTypeFilter from './ components/ServiceTypeFilter';
import SpecialismCheckboxes from './ components/SpecialismCheckboxes';
import { useAirTableData } from './ components/useAirtableData';
import { AppContainer, ContentContainer, MapContainer, DataContainer, Inputs } from './styles/LayoutStyles';

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

  const [airtableData, setAirTableData] = useAirTableData();

  const [geoJsonData, setGeoJsonData] = useState({
    type: "FeatureCollection",
    features: []
  });

  useEffect(() => {
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const fetchAndSetCoordinates = async () => {
      const featuresWithCoordinates = await Promise.all(airtableData.map(async (item) => {
        const coordinates = await fetchCoordinates(item["Service postcode"], accessToken);
        if (coordinates) {
          return {
            type: "Feature",
            properties: {
              name: item["Service name"],
              address: item["Service address"],
              postcode: item["Service postcode"],
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

      setGeoJsonData({
        type: "FeatureCollection",
        features: featuresWithCoordinates.filter(feature => feature !== null)
      });
    };

    if (airtableData.length > 0) {
      fetchAndSetCoordinates();
    }
  }, [airtableData]);

  useEffect(() => {
    const newServiceTypes = [...new Set(airtableData.map(item => item['Service type']))].filter(Boolean);
    const newSpecialisms = [...new Set(airtableData.map(item => item['Specialist services for']))].filter(Boolean);
    setServiceTypes(newServiceTypes);
    setSpecialisms(newSpecialisms);
  }, [airtableData]);

  useEffect(() => {
    let filtered = airtableData;

    if (selectedServiceType) {
      filtered = filtered.filter(item => item['Service type'] === selectedServiceType);
    }

    if (selectedSpecialisms.length > 0) {
      filtered = filtered.filter(item =>
        selectedSpecialisms.some(specialism =>
          item['Specialist services for'] && item['Specialist services for'].includes(specialism))
      );
    }

    setAirTableData(filtered);
  }, [airtableData, submittedSearchQuery, selectedServiceType, selectedSpecialisms, setAirTableData]);


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
    const updateairtableDataWithDistance = async () => {
      const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      let servicesWithDistance = await Promise.all(airtableData.map(async (item) => {
        const coordinates = await fetchCoordinates(item["Service postcode"], accessToken);
        if (coordinates) {
          const distance = calculateDistance(searchLat, searchLng, coordinates.latitude, coordinates.longitude);
          return { ...item, distance };
        }
        return null;
      }));

      servicesWithDistance = servicesWithDistance.filter(item => item !== null && item.distance <= 10);

      servicesWithDistance.sort((a, b) => a.distance - b.distance);

      const closestServices = servicesWithDistance.slice(0, 10);
      setAirTableData(closestServices);
    };

    if (searchLat && searchLng && airtableData.length > 0) {
      updateairtableDataWithDistance();
    }
  }, [airtableData, searchLat, searchLng, setAirTableData]);
  return (
    <>
      <AppContainer>
        <Banner />
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
            <Inputs>
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
            <div className="csv-data">
              {searchSubmitted && airtableData.length === 0 ? (
                <div>No services found within 10 miles of your search location.</div>
              ) : (
                <ul>
                  {airtableData.map((item, index) => (
                    <li key={index}>
                      {item["Service name"]}: {item["Service address"]}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DataContainer>
        </ContentContainer>
      </AppContainer>
      <footer>
        <p>Made with ❤️ by <a href="https://github.com/Moggach">Moggach</a></p>
        <p>Service isn't listed? <a href="https://454j5he3hbn.typeform.com/to/jrZlmRgL">Submit here</a></p>
      </footer>
    </>
  );
}
