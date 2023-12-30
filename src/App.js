import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29tbW9ua25vd2xlZGdlIiwiYSI6ImNqc3Z3NGZxcDA4NGo0OXA2dzd5eDJvc2YifQ.f68VZ1vlc6s3jg3JgShd0A';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-0.118092);
  const [lat, setLat] = useState(51.509865);
  const [zoom, setZoom] = useState(5);
  const [csvData, setCsvData] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // Parse CSV file
    Papa.parse('https://docs.google.com/spreadsheets/d/1Ks74q3_DsWZ_7OIqc3pJ-JzrVBfOKqhb2vB_gosoCSM/export?format=csv&gid=1299242923', {
      download: true,
      header: true,
      complete: (result) => {
        setCsvData(result.data);
        setFilteredData(result.data); // Initially set filtered data to all data

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: zoom,
        });

        map.current.on('move', () => {
          setLng(map.current.getCenter().lng.toFixed(4));
          setLat(map.current.getCenter().lat.toFixed(4));
          setZoom(map.current.getZoom().toFixed(2));
        });

        result.data.forEach(entry => {
          let approved = entry["Approved"];
          let name = entry["Service name"];
          let address = entry["Service address"];
          let postcode = entry["Service postcode"];
          let coordinates;

          if (approved === 'Approved') { // Only proceed if the item is approved
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${postcode}.json?country=GB&access_token=${mapboxgl.accessToken}`)
              .then(response => response.json())
              .then(data => {
                if (data.features && data.features.length > 0) {
                  coordinates = data.features[0].geometry.coordinates;

                  const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${name}</h4>
                    <div class="location-metadata">${address}</div>
                  `);

                  new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(popup)
                    .addTo(map.current);
                }
              });
          }
        });
      }
    });
  }, [lng, lat, zoom, csvData]);

  // Handle selection change in the dropdown
  const handleServiceChange = (event) => {
    const selectedServiceName = event.target.value;
    setSelectedService(selectedServiceName);

    // Filter data based on the selected service name
    setFilteredData(csvData.filter(item => item["Approved"] === 'Approved' && item["Service name"].toLowerCase().includes(selectedServiceName.toLowerCase())));
  };

  // Move the return statement inside the functional component
  return (
    <div>
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
      <div ref={mapContainer} className="map-container" />
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
  );
}
