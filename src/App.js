import React, { useState, useEffect } from 'react';
import MapBox from './ components/MapBox';
import SearchInput from './ components/SearchInput';
import Banner from './ components/Banner'
import ServiceTypeFilter from './ components/ServiceTypeFilter';
import SpecialismCheckboxes from './ components/SpecialismCheckboxes';
import { useCsvData } from './ components/useCsvData'

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
  const [lng, setLng] = useState(-0.1276);
  const [lat, setLat] = useState(51.5072);
  const [searchLng, setSearchlng] = useState('');
  const [searchLat, setSearchLat] = useState('');
  const [zoom, setZoom] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const [csvData, filteredData, setFilteredData] = useCsvData();

  const [geoJsonData, setGeoJsonData] = useState({
    type: "FeatureCollection",
    features: []
  });

  useEffect(() => {
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const fetchAndSetCoordinates = async () => {
      const featuresWithCoordinates = await Promise.all(filteredData.map(async (item) => {
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

    if (filteredData.length > 0) {
      fetchAndSetCoordinates();
    }
  }, [filteredData]);

  useEffect(() => {
    const newServiceTypes = [...new Set(csvData.map(item => item['Service type']))].filter(Boolean);
    const newSpecialisms = [...new Set(csvData.map(item => item['Specialist services for']))].filter(Boolean);
    setServiceTypes(newServiceTypes);
    setSpecialisms(newSpecialisms);
  }, [csvData]);

  useEffect(() => {
    let filtered = csvData;

    if (selectedServiceType) {
      filtered = filtered.filter(item => item['Service type'] === selectedServiceType);
    }

    if (selectedSpecialisms.length > 0) {
      filtered = filtered.filter(item =>
        selectedSpecialisms.some(specialism =>
          item['Specialist services for'] && item['Specialist services for'].includes(specialism))
      );
    }

    if (submittedSearchQuery) {
      filtered = filtered.filter(item => {

        return (item['Service address'] && item['Service address'].toLowerCase().includes(submittedSearchQuery.toLowerCase())) ||
          (item['Service name'] && item['Service name'].toLowerCase().includes(submittedSearchQuery.toLowerCase()));
      });
    }

    setFilteredData(filtered);
  }, [csvData, submittedSearchQuery, selectedServiceType, selectedSpecialisms, setFilteredData]);


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
    setLng(-0.1276);
    setLat(51.5072);
    setZoom(5);
    setSearchInput('');
    setSubmittedSearchQuery('');
    setSearchSubmitted(false);
  };

  useEffect(() => {
    const updateFilteredDataWithDistance = async () => {
      const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      let servicesWithDistance = await Promise.all(csvData.map(async (item) => {
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

      setFilteredData(closestServices);
    };

    if (searchLat && searchLng && csvData.length > 0) {
      updateFilteredDataWithDistance();
    }
  }, [csvData, searchLat, searchLng, setFilteredData]);
  return (
    <div>
      <Banner />
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
      <div className="csv-data">
        {searchSubmitted && filteredData.length === 0 ? (
          <div>No services found within 10 miles of your search location.</div>
        ) : (
          <ul>
            {filteredData.map((item, index) => (
              <li key={index}>
                <strong>{item["Service name"]}</strong>: {item["Service address"]}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p>Made with ❤️ by <a href="https://github.com/Moggach">Moggach</a></p>
      <p>Service isn't listed? <a href="https://454j5he3hbn.typeform.com/to/jrZlmRgL">Submit here</a></p>
    </div>
  );
}
