import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

export const useURLParams = (
  selectedServiceType: string,
  selectedSpecialisms: string[],
  submittedSearchQuery: string,
  currentPage: number
): void => {
  const router = useRouter();

  const updateURLParams = useCallback(() => {
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
      params.set('page', currentPage.toString());
    }

    router.replace(`/?${params.toString()}`);
  }, [
    router,
    selectedServiceType,
    selectedSpecialisms,
    submittedSearchQuery,
    currentPage,
  ]);

  useEffect(() => {
    updateURLParams();
  }, [updateURLParams]);

  return;
};