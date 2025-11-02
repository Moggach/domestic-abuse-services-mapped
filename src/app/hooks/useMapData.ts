import { useEffect, useState } from 'react';

import type { Properties, Geometry, Feature, FeatureCollection } from '../App';

interface FilteredDataItem {
  geometry: Geometry;
  properties: Properties;
}

export const useMapData = (
  filteredData: FilteredDataItem[],
  searchLat: number | null,
  searchLng: number | null,
  isSearchCleared: boolean,
  calculateDistance: (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => number,
  radius: number
) => {
  const [filteredMapBoxData, setFilteredMapBoxData] =
    useState<FeatureCollection | null>(null);

  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState<
    Feature[]
  >([]);

  useEffect(() => {
    const updateAirtableDataWithDistance = () => {
      if (!searchLat || !searchLng || isSearchCleared) {
        setFilteredMapBoxData({
          type: 'FeatureCollection',
          features: filteredData.map((item) => ({
            type: 'Feature',
            geometry: item.geometry,
            properties: item.properties,
          })),
        });
        return;
      }
      const servicesWithDistance: Feature[] = filteredData
        .map((item) => {
          const { coordinates } = item.geometry;
          if (coordinates && coordinates.length === 2) {
            const distance = calculateDistance(
              searchLat,
              searchLng,
              coordinates[1],
              coordinates[0]
            );
            return { ...item, distance };
          }
          return null;
        })
        .filter(
          (item): item is Feature & { distance: number } =>
            item !== null &&
            item.distance !== undefined &&
            item.distance <= radius // <-- Use radius here
        )
        .sort((a, b) => a.distance! - b.distance!);

      const topServices = servicesWithDistance.slice(0, 10);

      setFilteredDataWithDistance(topServices);

      setFilteredMapBoxData({
        type: 'FeatureCollection',
        features: topServices.map((item) => ({
          type: 'Feature',
          geometry: item.geometry,
          properties: {
            ...item.properties,
            distance: item.distance,
          },
        })),
      });
    };

    updateAirtableDataWithDistance();
  }, [
    searchLat,
    searchLng,
    filteredData,
    isSearchCleared,
    calculateDistance,
    radius,
  ]); // <-- Add radius to dependencies

  return { filteredMapBoxData, filteredDataWithDistance };
};
