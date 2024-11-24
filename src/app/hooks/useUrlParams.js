import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useURLParams = (selectedServiceType, selectedSpecialisms, submittedSearchQuery, currentPage) => {
  const router = useRouter();

  const updateURLParams = () => {
    const params = new URLSearchParams();

    if (selectedServiceType) {
      params.set('serviceType', selectedServiceType);
    }

    if (selectedSpecialisms.length > 0) {
      params.set('specialisms', selectedSpecialisms.join(','));
    }

    if (submittedSearchQuery) {
      params.set('search', submittedSearchQuery);
    }

    if (currentPage) {
      params.set('page', currentPage);
    }

    router.replace(`/?${params.toString()}`, { shallow: true });
  };

  useEffect(() => {
    updateURLParams();
  }, [selectedServiceType, selectedSpecialisms, submittedSearchQuery, currentPage]);

  return {};
};