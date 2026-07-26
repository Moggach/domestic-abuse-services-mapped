import mapboxgl, { NavigationControl } from 'mapbox-gl';
import React, { useRef, useEffect, useState } from 'react';

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
  isMapLoading: boolean;
  onActiveBoroughChange?: (borough: string | null) => void;
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
  setIsMapLoading,
  isMapLoading,
  onActiveBoroughChange,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [pinnedBorough, setPinnedBorough] = useState<string | null>(null);
  const activeBorough = hoveredBorough ?? pinnedBorough;

  useEffect(() => {
    if (map.current) return;

    const isMobile = window.innerWidth < 768;
    const minZoom = isMobile ? 4 : 5;
    const bounds = new mapboxgl.LngLatBounds([-7.5, 50.5], [1.0, 58.5]);

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/annacunnane/clrjjl9rf000101pg1r0z3vq7',
      center: [lng, lat],
      zoom: zoom,
      minZoom: minZoom,
      maxBounds: bounds,
    });

    map.current.on('load', () => {
      setIsMapLoading(false);
    });

    map.current.on('load', () => {
      const mapInstance = map.current!;

      mapInstance.on('mouseenter', 'boroughs-fill', () => {
        mapInstance.getCanvas().style.cursor = 'pointer';
      });

      mapInstance.on('mousemove', 'boroughs-fill', (e) => {
        const name = e.features?.[0]?.properties?.LAD24NM as string | undefined;
        setHoveredBorough(name ?? null);
      });

      mapInstance.on('mouseleave', 'boroughs-fill', () => {
        mapInstance.getCanvas().style.cursor = '';
        setHoveredBorough(null);
      });

      mapInstance.on('click', 'boroughs-fill', (e) => {
        const name = e.features?.[0]?.properties?.LAD24NM as string | undefined;
        if (!name) return;
        setPinnedBorough((prev) => (prev === name ? null : name));
      });
    });

    map.current.on('zoom', () => {
      if (!map.current) return;

      const currentZoom = map.current.getZoom();
      const minZoom = isMobile ? 4 : 5;

      if (currentZoom <= minZoom) {
        map.current.dragPan.disable();
      } else {
        map.current.dragPan.enable();
      }
    });

    const initialZoom = map.current.getZoom();
    if (initialZoom <= minZoom) {
      map.current.dragPan.disable();
    }

    map.current.addControl(new NavigationControl(), 'top-right');

    map.current.on('move', () => {
      setLng(parseFloat(map.current!.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current!.getCenter().lat.toFixed(4)));
    });
  }, [lng, lat, zoom, setLng, setLat, setIsMapLoading]);

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

    const addBoundariesLayer = () => {
      if (!map.current) return;

      if (!map.current.getSource('local-authorities')) {
        map.current.addSource('local-authorities', {
          type: 'geojson',
          data: '/data/local-authority-district.geojson',
        });
      }

      if (!map.current.getLayer('local-authorities-fill')) {
        map.current.addLayer({
          id: 'local-authorities-fill',
          type: 'fill',
          source: 'local-authorities',
          paint: {
            'fill-color': '#C0C0C0',
            'fill-opacity': 0.3,
          },
        });
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

      const boroughsWithServices = Array.from(
        new Set(
          data.features
            .filter((feature) => feature.properties?.localAuthority)
            .map((feature) => feature.properties!.localAuthority as string)
        )
      );

      const boroughFilter: mapboxgl.Expression = [
        'in',
        ['get', 'LAD24NM'],
        ['literal', boroughsWithServices],
      ];

      if (!map.current.getLayer('boroughs-fill')) {
        map.current.addLayer({
          id: 'boroughs-fill',
          type: 'fill',
          source: 'local-authorities',
          filter: boroughFilter,
          paint: {
            'fill-color': '#8b5cf6',
            'fill-opacity': 0.18,
          },
        });
      } else {
        map.current.setFilter('boroughs-fill', boroughFilter);
      }

      if (!map.current.getLayer('boroughs-outline')) {
        map.current.addLayer({
          id: 'boroughs-outline',
          type: 'line',
          source: 'local-authorities',
          filter: boroughFilter,
          paint: {
            'line-color': '#8b5cf6',
            'line-width': 1.5,
          },
        });
      } else {
        map.current.setFilter('boroughs-outline', boroughFilter);
      }
    };

    if (map.current.isStyleLoaded()) {
      addBoundariesLayer();
    } else {
      map.current.on('load', addBoundariesLayer);
    }
  }, [data, selectedLocalAuthority]);

  useEffect(() => {
    if (!map.current) return;

    if (!selectedLocalAuthority) {
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
          const [lng, lat] = authority.geometry.coordinates;
          map.current!.flyTo({
            center: [lng, lat],
            zoom: 10,
          });
        }
      })
      .catch((err) => console.error('Error fetching authority data:', err));
  }, [selectedLocalAuthority]);

  useEffect(() => {
    onActiveBoroughChange?.(activeBorough);
  }, [activeBorough, onActiveBoroughChange]);

  useEffect(() => {
    if (!map.current || !map.current.getLayer('boroughs-fill')) return;

    map.current.setPaintProperty('boroughs-fill', 'fill-opacity', [
      'case',
      ['==', ['get', 'LAD24NM'], activeBorough ?? ''],
      0.45,
      0.18,
    ]);
  }, [activeBorough]);

  return (
    <>
      {isMapLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div
        className="h-[400px] w-full lg:h-[800px] rounded-2xl"
        ref={mapContainer}
      />
    </>
  );
};

export default MapBox;
