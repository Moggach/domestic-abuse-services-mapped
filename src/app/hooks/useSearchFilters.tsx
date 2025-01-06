import { useState, useEffect } from 'react';

import type { FeatureCollection, Feature } from '../App';
import { filterByServiceType, filterBySpecialisms } from '../utils';

interface UseSearchFiltersReturn {
  selectedServiceType: string;
  setSelectedServiceType: (type: string) => void;
  selectedSpecialisms: string[];
  setSelectedSpecialisms: (specialisms: string[]) => void;
  filteredData: Feature[];
  setFilteredData: (data: Feature[]) => void;
  filteredDataWithDistance: Feature[];
  setFilteredDataWithDistance: (data: Feature[]) => void;
}

export const useSearchFilters = (
  serverAirtableData: FeatureCollection,
  isPostcode: (query: string) => boolean,
  submittedSearchQuery: string,
  searchSubmitted: boolean
): UseSearchFiltersReturn => {
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Feature[]>([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState<
    Feature[]
  >([]);

  useEffect(() => {
    let result = serverAirtableData.features;

    result = filterByServiceType(result, selectedServiceType);

    result = filterBySpecialisms(result, selectedSpecialisms);

    if (searchSubmitted && !isPostcode(submittedSearchQuery)) {
      const searchQueryLower = submittedSearchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = item.properties?.name;
        return name && name.toLowerCase().includes(searchQueryLower);
      });
    }

    setFilteredData(result);
  }, [
    selectedServiceType,
    selectedSpecialisms,
    searchSubmitted,
    submittedSearchQuery,
    serverAirtableData,
    isPostcode,
  ]);

  return {
    selectedServiceType,
    setSelectedServiceType,
    selectedSpecialisms,
    setSelectedSpecialisms,
    filteredData,
    setFilteredData,
    filteredDataWithDistance,
    setFilteredDataWithDistance,
  };
};
