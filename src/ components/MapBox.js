import React, { useRef, useEffect, useState, useCallback } from 'react';
import PopUp from '../ components/PopUp'
import mapboxgl, { NavigationControl } from 'mapbox-gl';
import loadingIndicator from '../images/svgs/loading_indicator.svg';
import { MapWrapper, Loading } from '../styles/LayoutStyles';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function MapBox({
  lng,
  lat,
  zoom,
  data,
  setLng,
  setLat,
  setZoom,
  searchLng,
  searchLat,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPointRadius = useCallback(() => {
    return window.innerWidth <= 768 ? 6 : 4;
  }, []);

  useEffect(() => {
    if (map.current) return; // Prevent re-initialization

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoading(false); // Set loading to false when the map is loaded
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
    });

  }, [lng, lat, zoom, setLng, setLat, setZoom]);

  useEffect(() => {
    if (map.current && searchLat && searchLng) {
      map.current.flyTo({
        center: [searchLng, searchLat],
        zoom: zoom,
      });
    }
  }, [searchLat, searchLng, zoom]);

  useEffect(() => {
    if (!map.current) return;

    const handleZoomEnd = () => {
      const currentZoom = map.current.getZoom();
      if (currentZoom < 10) {
        setPopupInfo(null);
      }
    };

    map.current.on('zoomend', handleZoomEnd);

    return () => {
      if (map.current) {
        map.current.off('zoomend', handleZoomEnd);
      }
    };
  }, [setPopupInfo]);

  // A reusable function to handle both click and touch events
  const handlePointSelect = useCallback((e) => {
    while (Math.abs(e.lngLat.lng - e.features[0].geometry.coordinates[0]) > 180) {
      e.features[0].geometry.coordinates[0] += e.lngLat.lng > e.features[0].geometry.coordinates[0] ? 360 : -360;
    }

    const coordinates = e.features[0].geometry.coordinates;
    const properties = e.features[0].properties;

    setPopupInfo({
      coordinates,
      name: properties.name,
      address: properties.address,
      phone: properties.phone,
      email: properties.email,
      website: properties.website,
      donate: properties.donate
    });
  }, [setPopupInfo]);

  useEffect(() => {
    if (!map.current) return;

    const loadPoints = () => {
      if (data) {
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
              'circle-radius': getPointRadius(),
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            },
          });

          map.current.on('click', 'unclustered-point', handlePointSelect);
          map.current.on('touchstart', 'unclustered-point', handlePointSelect);

          map.current.on('mouseenter', 'unclustered-point', () => {
            map.current.getCanvas().style.cursor = 'pointer';
          });
          map.current.on('mouseleave', 'unclustered-point', () => {
            map.current.getCanvas().style.cursor = '';
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
  }, [data, getPointRadius, handlePointSelect]);

  return (
    <MapWrapper ref={mapContainer}>
      {isLoading && <Loading alt="a rotating yellow circular line indicating a loading state" src={loadingIndicator} />}
      {!isLoading && popupInfo && <PopUp map={map} {...popupInfo} />}
    </MapWrapper>
  );
};