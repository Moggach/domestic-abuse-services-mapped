import React, { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29tbW9ua25vd2xlZGdlIiwiYSI6ImNqc3Z3NGZxcDA4NGo0OXA2dzd5eDJvc2YifQ.f68VZ1vlc6s3jg3JgShd0A';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-0.118092);
  const [lat, setLat] = useState(51.509865);
  const [zoom, setZoom] = useState(9);
  const [csvData, setCsvData] = useState([]);

  const services = useMemo(() => [
    { name: 'Wandsworth One Stop Shop', address: 'St. Mark’s, Battersea Rise, SW11 1EJ', lnglat: [-0.1759, 51.4647] },
    { name: 'Southall Black Sisters', address: '21 Avenue Road, Southall, Middlesex, UB1 3B', lnglat: [-0.37573400442787863, 51.50899538815917] },
  ], []);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // Parse CSV file
    Papa.parse('https://media.githubusercontent.com/media/datablist/sample-csv-files/main/files/organizations/organizations-100.csv', {
      download: true,
      header: true,
      complete: (result) => {
          console.log('Parsed CSV Data:', result.data);

        setCsvData(result.data);
      },
      error: (error) => {
        console.error('CSV parsing error:', error.message);
      },
    });

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

    services.forEach(({ name, address, lnglat }) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setText(name);

      new mapboxgl.Marker()
        .setLngLat(lnglat)
        .setPopup(popup)
        .addTo(map.current);
    });

  }, [lng, lat, zoom, services, csvData]);

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
      <div className="csv-data">
        <h2>CSV Data</h2>
        <ul>
          {csvData.map((item, index) => (
            <li key={index}>
              <strong>{item.Name}</strong>: {item.Country}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
