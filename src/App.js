import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // Remove the '!'

mapboxgl.accessToken = 'pk.eyJ1IjoiY29tbW9ua25vd2xlZGdlIiwiYSI6ImNqc3Z3NGZxcDA4NGo0OXA2dzd5eDJvc2YifQ.f68VZ1vlc6s3jg3JgShd0A';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-0.118092);
  const [lat, setLat] = useState(51.509865);
    
  const [zoom, setZoom] = useState(9);

  const services = [
    { name: 'Wandsworth One Stop Shop', address: 'St. Mark’s, Battersea Rise, SW11 1EJ', lnglat: [-0.1759, 51.4647] },
    { name: 'Southall Black Sisters', address: '21 Avenue Road, Southall, Middlesex, UB1 3B', lnglat: [ -0.37573400442787863, 51.50899538815917] },  ];

  useEffect(() => {
    if (map.current) return; // initialize map only once
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
  }, [lng, lat, zoom, services]); // Add dependencies to the dependency array

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
