import { useState, useEffect } from 'react';

import { filterByServiceType, filterBySpecialisms } from '../utils';

export const useSearchFilters = (
  serverAirtableData,
  isPostcode,
  submittedSearchQuery,
  searchSubmitted
) => {
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedSpecialisms, setSelectedSpecialisms] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataWithDistance, setFilteredDataWithDistance] = useState([]);

  useEffect(() => {
    let result = serverAirtableData.features;

    result = filterByServiceType(result, selectedServiceType);
    result = filterBySpecialisms(result, selectedSpecialisms);

    if (searchSubmitted && !isPostcode(submittedSearchQuery)) {
      const searchQueryLower = submittedSearchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = item.properties?.name || item['Name'];
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
