import React, { useState, useEffect } from 'react';
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
  const [lng, setLng] = useState(-0.1276); // Example initial value for London
  const [lat, setLat] = useState(51.5072); // Example initial value for London
  const [zoom, setZoom] = useState(9); // Example initial zoom level

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
    let filtered = csvData;

    if (selectedServiceType) {
      filtered = filtered.filter(item => item.serviceType === selectedServiceType);
    }

    if (selectedSpecialisms.length > 0) {
      filtered = filtered.filter(item => selectedSpecialisms.some(specialism => item.specialisms.includes(specialism)));
    }

    if (searchQuery) {
      filtered = filtered.filter(item => {
        return item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    setFilteredData(filtered);
  }, [csvData, searchQuery, selectedServiceType, selectedSpecialisms]);



  return (
    <div>
      <Banner/>
      {/* <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ServiceTypeFilter
        selectedServiceType={selectedServiceType}
        setSelectedServiceType={setSelectedServiceType}
      // serviceTypes={serviceTypes} // derived from csvData as shown above
      />

      <SpecialismCheckboxes
        // specialisms={specialisms} // derived from csvData as shown above
        selectedSpecialisms={selectedSpecialisms}
        setSelectedSpecialisms={setSelectedSpecialisms}
      /> */}

      <MapBox
        lng={lng}
        lat={lat}
        zoom={zoom}
        data={geoJsonData}
        setLng={setLng}
        setLat={setLat}
        setZoom={setZoom}
      />
    </div>
  );
}
