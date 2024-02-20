import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function MapBox({ lng, lat, zoom, data, setLng, setLat, setZoom, zoomSetProgrammaticallyRef, searchLng, searchLat
}) {

  const mapContainer = useRef(null);
  const map = useRef(null);

  // Initial map setup
  useEffect(() => {
    if (map.current) return; // Exit if map already initialized
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      if (!zoomSetProgrammaticallyRef.current) {
        setZoom(map.current.getZoom());
      }
    });
  }, [lng, lat, zoom, setLng, setLat, setZoom, zoomSetProgrammaticallyRef]);

  useEffect(() => {

    if (searchLat && searchLng)  {
      map.current.flyTo({
        center: [searchLng, searchLat],
        zoom: 12
      });
    }
  }, [searchLat, searchLng, zoom]);


  useEffect(() => {
    if (!map.current) return;

    const loadPoints = () => {
      if (data && data.features.length > 0) {
        if (!map.current.getSource('points')) {
          map.current.addSource('points', {
            type: 'geojson',
            data: data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 20,
          });

          map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'points',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1',
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40,
              ],
            },
          });

          map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'points',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#ffffff',
            },
          });

          map.current.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'points',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#11b4da',
              'circle-radius': 4,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            },
          });
        } else {
          map.current.getSource('points').setData(data);
        }
      }
    };

    if (map.current.isStyleLoaded()) {
      loadPoints();
    } else {
      map.current.on('load', loadPoints);
    }

    return () => {
      map.current.off('load', loadPoints);
    };
  }, [data]);

  return <div ref={mapContainer} className="map-container" />;
}