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

  useEffect(() => {
    const updateAirtableDataWithDistance = () => {
      if (isSearchCleared) return;

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
      setFilteredDataWithDistance(servicesWithDistance.slice(0, 10));
    };

    updateAirtableDataWithDistance();
  }, [searchLat, searchLng, filteredData, isSearchCleared]);

  useEffect(() => {
    setFilteredMapBoxData({
      type: 'FeatureCollection',
      features: filteredData,
    });
  }, [filteredData]);

  return {
    filteredMapBoxData,
    filteredDataWithDistance,
  };
};
