import { useEffect, useCallback } from 'react';

export const useURLParams = (
  selectedServiceType: string,
  selectedLocalAuthority: string,
  selectedSpecialisms: string[],
  submittedSearchQuery: string,
  currentPage: number
): void => {
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedServiceType) {
      params.set('serviceType', selectedServiceType);
    }

    if (selectedLocalAuthority) {
      params.set('localAuthority', selectedLocalAuthority);
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

    // Update the URL without a Next.js navigation: router.replace() would
    // re-request the page and reset keyboard focus to the top of the
    // document on every filter change.
    window.history.replaceState(null, '', `/?${params.toString()}`);
  }, [
    selectedServiceType,
    selectedLocalAuthority,
    selectedSpecialisms,
    submittedSearchQuery,
    currentPage,
  ]);

  useEffect(() => {
    updateURLParams();
  }, [updateURLParams]);

  return;
};
