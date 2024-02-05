import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
import Banner from './ components/Banner';
import { getDistance } from 'geolib';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-0.118092);
  const [lat, setLat] = useState(51.509865);
  const [zoom, setZoom] = useState(5);
  const [csvData, setCsvData] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');


  const updateMapData = async (data) => {

    let features = await Promise.all(data.map(async (entry, index) => {

      const postcode = entry['Service postcode'];
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?country=GB&access_token=${mapboxgl.accessToken}`);
      const responseData = await response.json();

      const coordinates = responseData.features[0].geometry.coordinates;

      return {
        type: 'Feature',
        properties: {
          cluster_id: index,
          Approved: entry['Approved'],
          'name': entry['Service name'],
          'address': entry['Service address'],
          'postcode': postcode,
          'service type': entry['Service type'],
        },
        geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
      };
    }));

    let geojson = {
      type: 'FeatureCollection',
      features: features,
    };

    if (map.current.getSource('points')) {
      map.current.getSource('points').setData(geojson);
    } else {
      map.current.addSource('points', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 20,
      });
    }
  };

  useEffect(() => {
    if (map.current) return;

    Papa.parse('https://docs.google.com/spreadsheets/d/1Ks74q3_DsWZ_7OIqc3pJ-JzrVBfOKqhb2vB_gosoCSM/export?format=csv&gid=1299242923', {
      download: true,
      header: true,
      complete: (result) => {
        const approvedData = result.data.filter(item => item.Approved === 'Approved');
        setCsvData(approvedData);

        setFilteredData(approvedData);


        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
          center: [lng, lat],
          zoom: zoom,
        });

        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });

        (async () => {
          let features = await Promise.all(approvedData.map(async (entry, index) => {
            const postcode = entry['Service postcode'];
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?country=GB&access_token=${mapboxgl.accessToken}`);
            const data = await response.json();

            const coordinates = data.features[0].geometry.coordinates;

            return {
              type: 'Feature',
              properties: {
                cluster_id: index,
                Approved: entry['Approved'],
                'name': entry['Service name'],
                'address': entry['Service address'],
                'service type': entry['Service type'],
                'postcode': postcode,
              },
              geometry: {
                type: 'Point',
                coordinates: coordinates,
              },
            };
          }));

          let geojson = {
            type: 'FeatureCollection',
            features: features,
          };

          map.current.on('load', function () {
            if (!map.current.getSource('points')) {
              map.current.addSource('points', {
                type: 'geojson',
                data: geojson,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 20,
              });
            }

            if (!map.current.getLayer('cluster-count')) {
              map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'points',
                filter: ['has', 'point_count'],
                layout: {
                  'text-field': ['get', 'point_count_abbreviated'],
                  'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                  'text-size': 20
                }
              });
            }

            if (!map.current.getLayer('unclustered-point')) {
              map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'points',
                filter: ['!', ['has', 'point_count']],
                paint: {
                  'circle-color': '#11b4da',
                  'circle-radius': 8,
                  'circle-stroke-width': 1,
                  'circle-stroke-color': '#fff'
                }
              });

              map.current.on('click', 'unclustered-point', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const name = e.features[0].properties.name;
                const address = e.features[0].properties.address;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(`${name} ${address}`)
                  .addTo(map.current);
              });
            };
          });
        })();
      }
    });
  }, [lng, lat, zoom, csvData]);

  const handleServiceTypeChange = (event) => {
    const selectedServiceTypeName = event.target.value;
    setSelectedServiceType(selectedServiceTypeName);

    const filteredServiceData = csvData.filter(item => item["Approved"] === 'Approved' && item["Service type"].toLowerCase().includes(selectedServiceTypeName.toLowerCase()));
    setFilteredData(filteredServiceData);

    updateMapData(filteredServiceData);
  };
  const handleSearch = async () => {
    if (!searchQuery) return;

    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?country=GB&access_token=${mapboxgl.accessToken}`;
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.features.length > 0) {
      const { coordinates } = data.features[0].geometry;
      filterDataByDistance(coordinates);
    }
  };

  const filterDataByDistance = (searchCoordinates) => {
    const radius = 32186.9; // 20 miles in meters

    if (map.current && map.current.isSourceLoaded('points')) {
      const sourceData = map.current.getSource('points')._data;

      const filteredFeatures = sourceData.features.filter(feature => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const distance = getDistance(
          { latitude: searchCoordinates[1], longitude: searchCoordinates[0] },
          { latitude, longitude }
        );
        return distance <= radius;
      });

      let transformedArray = filteredFeatures.map(feature => {
        let { Approved, name, address, postcode, 'service type': serviceType } = feature.properties;
        return {
          Approved: Approved,
          'Service name': name,
          'Service address': address,
          'Service postcode': postcode,
          'Service type': serviceType 
        };
      });


      setFilteredData(transformedArray);
      updateMapData(transformedArray)
    }
  };
  const clearSearch = () => {
    setSearchQuery('');
    const approvedData = csvData.filter(item => item.Approved === 'Approved');
    setFilteredData(approvedData);

    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
      });
    }

    updateMapData(approvedData);
  };

  return (
    <>
      <Banner />
      <div>
        <div ref={mapContainer} className="map-container" />
        <div>
          <label htmlFor="searchInput">Search by location: </label>
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={clearSearch}>Clear Search</button>
        </div>
        <div>
          <label htmlFor="serviceFilter">Filter service type</label>
          <select
            id="serviceFilter"
            value={selectedServiceType}
            onChange={handleServiceTypeChange}
          >
            <option value="">All service types</option>
            {
              [...new Set(csvData.map(item => item["Service type"]))]
                .map((serviceType, index) => (
                  <option key={index} value={serviceType}>
                    {serviceType}
                  </option>
                ))
            }
          </select>
        </div>
        <div className="csv-data">
          <ul>
            {filteredData.map((item, index) => (

              <li key={index}>

                <strong>{item["Service name"]}</strong>: {item["Service address"]}
              </li>
            ))}
          </ul>
          {filteredData.length === 0 && <p>Sorry! No results found. Try another search?</p>}

        </div>
        <p>Made with ❤️ by <a href="https://github.com/Moggach">Moggach</a></p>
        <p>Service isn't listed? <a href="https://454j5he3hbn.typeform.com/to/jrZlmRgL">Submit here</a></p>
      </div>
    </>
  );
}