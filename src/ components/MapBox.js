import React, { useRef, useEffect, useState, useCallback } from 'react';
import PopUp from '../ components/PopUp'
import mapboxgl, { NavigationControl } from 'mapbox-gl';
import loadingIndicator from '../images/svgs/loading_indicator.svg';
import { MapWrapper } from '../styles/LayoutStyles';

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
  const [popupInfo, setPopupInfo] = React.useState(null);
  const [isLoading, setIsLoading] = useState(true);
  

   
   const getPointRadius = useCallback(() => {
    return window.innerWidth <= 768 ? 6 : 4;
 }, []);

  // Initial map setup
  useEffect(() => {
    if (map.current) return;
    

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
        center: [lng, lat],
        zoom: zoom,
      });
  
      map.current.addControl(new NavigationControl(), 'top-right');
  
      map.current.on('load', () => {
        setIsLoading(false);
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
              'circle-radius': getPointRadius(),
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            },
          }
          );
          map.current.on('click', 'unclustered-point', (e) => {
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - e.features[0].geometry.coordinates[0]) > 180) {
              e.features[0].geometry.coordinates[0] += e.lngLat.lng > e.features[0].geometry.coordinates[0] ? 360 : -360;
            }

            const coordinates = e.features[0].geometry.coordinates;
            const name = e.features[0].properties.name;
            const address = e.features[0].properties.address;
            const phone = e.features[0].properties.phone;
            const email = e.features[0].properties.email;
            const website = e.features[0].properties.website;
            const donate = e.features[0].properties.donate;


            setPopupInfo({ coordinates, name, address, phone, email, website, donate });


          });

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
  }, [data, getPointRadius]);

  return (
    <MapWrapper ref={mapContainer}>
      {isLoading && <img alt="a rotating yellow circular line indicating a loading state"src={loadingIndicator}></img>}
      {!isLoading && popupInfo && <PopUp map={map} {...popupInfo} />}
    </MapWrapper>
  )
};
