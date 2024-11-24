import { useEffect, useState } from 'react';

export const useMapData = (
  filteredData,
  searchLat,
  searchLng,
  isSearchCleared,
  calculateDistance
) => {
  const [filteredMapBoxData, setFilteredMapBoxData] = useState(null);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);

  useEffect(
    () => {
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

        let servicesWithDistance = filteredData.map((item) => {
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
        });

        servicesWithDistance = servicesWithDistance.filter(
          (item) => item !== null && item.distance <= 10
        );
        servicesWithDistance.sort((a, b) => a.distance - b.distance);

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
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [searchLat, searchLng, filteredData, isSearchCleared]
  );

  return { filteredMapBoxData, filteredDataWithDistance };
};
