import React, { useState, useEffect, useRef } from 'react';
import MapBox from './ components/MapBox';
import SearchInput from './ components/SearchInput';
import Banner from './ components/Banner'
import ServiceTypeFilter from './ components/ServiceTypeFilter';
import SpecialismCheckboxes from './ components/SpecialismCheckboxes';
import { useCsvData } from './ components/useCsvData'


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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [specialisms, setSpecialisms] = useState([]);
  const [lng, setLng] = useState(-0.1276);
  const [lat, setLat] = useState(51.5072);
  const [zoom, setZoom] = useState(5);
  const zoomSetProgrammaticallyRef = useRef(false);

  console.log(zoomSetProgrammaticallyRef)

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

    if (searchQuery) {
      filtered = filtered.filter(item => {
        return (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    setFilteredData(filtered);
  }, [csvData, searchQuery, selectedServiceType, selectedSpecialisms, setFilteredData]);

  const handleSearchSubmit = async () => {
    if (!searchQuery) return;
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const coordinates = await fetchCoordinates(searchQuery, accessToken);

    if (coordinates) {
      zoomSetProgrammaticallyRef.current = true;

      setLng(coordinates.longitude);
      setLat(coordinates.latitude);
      setZoom(10);

      setTimeout(() => {
        zoomSetProgrammaticallyRef.current = false;
      }, 500);
    }
  };


  const handleSearchClear = () => {
    // Reset map view or state as necessary
    setLng(-0.1276);
    setLat(51.5072);
    setZoom(5);

  };

  console.log('app', zoomSetProgrammaticallyRef)

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
        zoomSetProgrammaticallyRef={zoomSetProgrammaticallyRef}

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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
        zoomSetProgrammaticallyRef={zoomSetProgrammaticallyRef}

      />
      <div className="csv-data">
        <ul>
          {filteredData.map((item, index) => (
            <li key={index}>
              <strong>{item["Service name"]}</strong>: {item["Service address"]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
