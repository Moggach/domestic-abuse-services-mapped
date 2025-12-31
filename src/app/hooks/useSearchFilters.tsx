import { useState, useEffect } from 'react';

import type { FeatureCollection, Feature } from '../App';
import {
  filterByServiceType,
  filterBySpecialisms,
  filterByLocalAuthority,
} from '../utils';

interface UseSearchFiltersReturn {
  selectedServiceType: string;
  setSelectedServiceType: (type: string) => void;
  selectedLocalAuthority: string;
  setSelectedLocalAuthority: (type: string) => void;
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
  const [selectedLocalAuthority, setSelectedLocalAuthority] =
    useState<string>('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Feature[]>([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState<
    Feature[]
  >([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlServiceType = params.get('serviceType') || '';
    const urlLocalAuthority = params.get('localAuthority') || '';
    const urlSpecialisms = params.get('specialisms')
      ? params.get('specialisms')!.split(',')
      : [];

    setSelectedServiceType((prev) => prev || urlServiceType);
    setSelectedLocalAuthority((prev) => prev || urlLocalAuthority);
    setSelectedSpecialisms((prev) =>
      prev.length === 0 ? urlSpecialisms : prev
    );
  }, []);

  useEffect(() => {
    let result = serverAirtableData.features;
    result = filterByLocalAuthority(result, selectedLocalAuthority);

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
    selectedLocalAuthority,
    selectedSpecialisms,
    searchSubmitted,
    submittedSearchQuery,
    serverAirtableData,
    isPostcode,
  ]);

  return {
    selectedServiceType,
    setSelectedServiceType,
    selectedLocalAuthority,
    setSelectedLocalAuthority,
    selectedSpecialisms,
    setSelectedSpecialisms,
    filteredData,
    setFilteredData,
    filteredDataWithDistance,
    setFilteredDataWithDistance,
  };
};
