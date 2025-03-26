import mapboxgl, { NavigationControl } from 'mapbox-gl';
import React, { useRef, useEffect, useState, useCallback } from 'react';

import PopUp from './PopUp';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

interface MapBoxProps {
  lng: number;
  lat: number;
  zoom: number;
  data: GeoJSON.FeatureCollection;
  setLng: React.Dispatch<React.SetStateAction<number>>;
  setLat: React.Dispatch<React.SetStateAction<number>>;
  searchLng?: number;
  searchLat?: number;
  selectedLocalAuthority?: string;
  setIsMapLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PopupInfo {
  coordinates: [number, number];
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  donate?: string;
}

const MapBox: React.FC<MapBoxProps> = ({
  lng,
  lat,
  zoom,
  data,
  setLng,
  setLat,
  searchLng,
  searchLat,
  selectedLocalAuthority,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.on('load', () => {
      setIsMapLoading(false);
    });

    map.current.addControl(new NavigationControl(), 'top-right');

    map.current.on('move', () => {
      setLng(parseFloat(map.current!.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current!.getCenter().lat.toFixed(4)));
      setPopupInfo(null);
    });

    map.current.on('zoomend', () => {
      setPopupInfo(null);
    });
  }, [lng, lat, zoom, setLng, setLat]);

  useEffect(() => {
    if (map.current && searchLat && searchLng) {
      setPopupInfo(null);
      map.current.flyTo({
        center: [searchLng, searchLat],
        zoom: zoom,
      });
    }
  }, [searchLat, searchLng, zoom]);
  useEffect(() => {
    if (!map.current) return;
  
    const handleZoomEnd = () => {
      setPopupInfo(null);
      const source = map.current!.getSource('points') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [],
        });
  
        setTimeout(() => source.setData(data), 0);
      }
    };
  
    const handleMove = () => setPopupInfo(null);
  
    map.current.on('zoomend', handleZoomEnd);
    map.current.on('move', handleMove);
  
    return () => {
      if (map.current) {
        map.current.off('zoomend', handleZoomEnd);
        map.current.off('move', handleMove);
      }
    };
  }, [data]);
  
  const handlePointSelect = useCallback(
    (
      e: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) &
        mapboxgl.EventData & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      if (!e.features || !e.features[0]) return;

      const geometry = e.features[0].geometry;
      if (geometry.type === 'Point') {
        const coordinates = geometry.coordinates as [number, number];
        const properties = e.features[0].properties as Record<string, any>;

        setPopupInfo({
          coordinates,
          name: properties.name || '',
          address: properties.address || '',
          phone: properties.phone || '',
          email: properties.email || '',
          website: properties.website || '',
          donate: properties.donate || '',
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!map.current) return;

    const loadPoints = () => {
      if (data) {
        const source = map.current!.getSource(
          'points'
        ) as mapboxgl.GeoJSONSource;

        if (source) {
          source.setData(data);
        } else {
          map.current!.addSource('points', {
            type: 'geojson',
            data: data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 20,
          });

          map.current!.addLayer({
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

          map.current!.addLayer({
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

          map.current!.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'points',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#11b4da',
              'circle-radius': 5,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
            },
          });
        }
      }

      map.current!.on('click', 'unclustered-point', handlePointSelect);
    };

    const addBoundariesLayer = () => {
      if (!map.current) return;

      if (!map.current.getSource('local-authorities')) {
        map.current.addSource('local-authorities', {
          type: 'geojson',
          data: '/data/local-authority-district.geojson',
        });
      }

      if (!map.current.getLayer('local-authorities-fill')) {
        map.current.addLayer(
          {
            id: 'local-authorities-fill',
            type: 'fill',
            source: 'local-authorities',
            paint: {
              'fill-color': '#C0C0C0',
              'fill-opacity': 0.3,
            },
          },
          'clusters'
        );
      }

      if (selectedLocalAuthority) {
        map.current.setFilter('local-authorities-fill', [
          '==',
          ['get', 'LAD24NM'],
          selectedLocalAuthority,
        ]);
      } else {
        map.current.setFilter('local-authorities-fill', false);
      }
    };

    if (map.current.isStyleLoaded()) {
      loadPoints();
      addBoundariesLayer();
    } else {
      map.current.on('load', () => {
        loadPoints();
        addBoundariesLayer();
      });
    }
  }, [data, selectedLocalAuthority]);

  useEffect(() => {
    if (!map.current) return;

    if (!selectedLocalAuthority) {
      setPopupInfo(null);
      map.current.flyTo({
        center: [lng, lat],
        zoom: zoom,
      });
      return;
    }

    fetch('/data/local-authority-centroids.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        const authority = geojson.features.find(
          (feature: any) =>
            feature.properties.LAD24NM === selectedLocalAuthority
        );

        if (authority) {
          setPopupInfo(null);
          const [lng, lat] = authority.geometry.coordinates;
          map.current!.flyTo({
            center: [lng, lat],
            zoom: 10,
          });
        }
      })
      .catch((err) => console.error('Error fetching authority data:', err));
  }, [selectedLocalAuthority]);



  return (
    <>
      {isMapLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="h-[400px] w-full mb-8 lg:h-[800px] lg:mb-0 lg:basis-1/2 rounded-2xl" ref={mapContainer}>
        {popupInfo && <PopUp map={map} {...popupInfo} />}
      </div>
    </>
  );
};

export default MapBox;