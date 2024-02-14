import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function MapBox({ lng, lat, zoom, data, setLng, setLat, setZoom }) {

  const mapContainer = useRef(null);
  const map = useRef(null);
 

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('load', () => {
  
      if (data && data.features.length > 0) {
 
        if (!map.current.getSource('points')) {
          map.current.addSource('points', {
            type: 'geojson',
            data: data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 20,
          });
        } else {
          map.current.getSource('points').setData(data);
        }
      }
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  }, [lng, lat, zoom, data]); 

  return <div ref={mapContainer} className="map-container" />;
}