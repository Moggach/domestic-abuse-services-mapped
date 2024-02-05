import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
import Banner from './ components/Banner';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-0.118092);
  const [lat, setLat] = useState(51.509865);
  const [zoom, setZoom] = useState(5);
  const [csvData, setCsvData] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [filteredData, setFilteredData] = useState([]);


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

  const handleServiceChange = (event) => {
    const selectedServiceName = event.target.value;
    setSelectedService(selectedServiceName);

    const filteredServiceData = csvData.filter(item => item["Approved"] === 'Approved' && item["Service name"].toLowerCase().includes(selectedServiceName.toLowerCase()));
    setFilteredData(filteredServiceData);

    updateMapData(filteredServiceData);
  };

  return (
    <>
      <Banner />
      <div>
        <div ref={mapContainer} className="map-container" />
        <div>
          <label htmlFor="serviceSelect">Select Service Name:</label>
          <select
            id="serviceSelect"
            value={selectedService}
            onChange={handleServiceChange}
          >
            <option value="">All Services</option>
            {csvData.map((item, index) => (
              <option key={index} value={item["Service name"]}>
                {item["Service name"]}
              </option>
            ))}
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
        </div>
        <p>Made with ❤️ by <a href="https://github.com/Moggach">Moggach</a></p>
        <p>Service isn't listed? <a href="https://454j5he3hbn.typeform.com/to/jrZlmRgL">Submit here</a></p>
      </div>
    </>
  );
}