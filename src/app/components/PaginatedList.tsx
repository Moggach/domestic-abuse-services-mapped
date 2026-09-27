import React, { useEffect, useMemo, useRef } from 'react';
import type { IconType } from 'react-icons';
import {
  AiOutlineGlobal,
  AiOutlineHeart,
  AiOutlineMail,
  AiOutlinePhone,
} from 'react-icons/ai';

import { SUBMIT_SERVICE_URL } from '../constants/links';
import { iconMapping } from '../constants/serviceIcons';
import { safeExternalUrl } from '../lib/urls';
import type { Feature } from '../types';

import ClearFiltersButton from './ClearFiltersButton';

type Item = Pick<Feature, 'properties' | 'distance'>;

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Results pages"
      className="flex justify-center items-center mt-8"
    >
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 mr-2 btn btn-accent text-white font-semibold"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 ml-2 btn btn-accent font-semibold text-white"
      >
        Next
      </button>
    </nav>
  );
};

interface PaginatedListProps {
  data: Item[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  searchSubmitted: boolean;
  submittedSearchQuery: string;
  isPostcode: (input: string) => boolean;
  radius: number;
  hasFiltersApplied: boolean;
  onClearFilters: () => void;
}

const getResultsSummary = (
  count: number,
  searchSubmitted: boolean,
  submittedSearchQuery: string,
  isPostcode: (input: string) => boolean,
  radius: number,
  hasFiltersApplied: boolean
): string => {
  const services = count === 1 ? 'service' : 'services';

  if (searchSubmitted && submittedSearchQuery) {
    if (isPostcode(submittedSearchQuery)) {
      return count > 0
        ? `${count} ${services} within ${radius} miles of ${submittedSearchQuery}`
        : `No services found within ${radius} miles of ${submittedSearchQuery}. Try a larger radius, another search or removing filters.`;
    }
    return count > 0
      ? `${count} ${services} matching "${submittedSearchQuery}"`
      : `No services found matching "${submittedSearchQuery}". Try another search or remove any filters.`;
  }

  if (count === 0) {
    return 'No services match these filters. Try removing some filters.';
  }
  return hasFiltersApplied
    ? `${count} ${services} match your filters`
    : `${count} ${services}`;
};

const PaginatedList: React.FC<PaginatedListProps> = ({
  data,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  searchSubmitted,
  submittedSearchQuery,
  isPostcode,
  radius,
  hasFiltersApplied,
  onClearFilters,
}) => {
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const movedPageRef = useRef(false);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, data, itemsPerPage]);

  // Filters can leave the current page out of range; this reset shouldn't
  // scroll or move focus, so it bypasses handlePageChange.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // After Previous/Next, bring the top of the new page into view and move
  // focus there so keyboard and screen reader users start at the new results.
  useEffect(() => {
    if (!movedPageRef.current) return;
    movedPageRef.current = false;
    const heading = resultsHeadingRef.current;
    if (!heading) return;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    heading.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    heading.focus({ preventScroll: true });
  }, [currentPage]);

  const handlePageChange = (newPage: number): void => {
    movedPageRef.current = true;
    setCurrentPage(newPage);
  };

  const getIconforBadge = (text: string): IconType | null => {
    return iconMapping[text] || null;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          ref={resultsHeadingRef}
          tabIndex={-1}
          className="font-headings text-lg scroll-mt-4"
          role="status"
          aria-live="polite"
        >
          {getResultsSummary(
            data.length,
            searchSubmitted,
            submittedSearchQuery,
            isPostcode,
            radius,
            hasFiltersApplied
          )}
        </h2>
        {hasFiltersApplied && data.length > 0 && (
          <ClearFiltersButton onClear={onClearFilters} />
        )}
      </div>

      {data.length === 0 && (
        <div className="mt-6 rounded-2xl bg-base-200 p-6 flex flex-col gap-3">
          {hasFiltersApplied && <ClearFiltersButton onClear={onClearFilters} />}
          <p>
            For help finding support, call the National Domestic Abuse Helpline,
            free and 24 hours a day, on{' '}
            <a className="underline font-semibold" href="tel:08082000247">
              0808 2000 247
            </a>
            .
          </p>
          <p>
            Know a service that should be listed?{' '}
            <a className="underline" href={SUBMIT_SERVICE_URL}>
              Submit a service
            </a>
          </p>
        </div>
      )}

      {paginatedData.length > 0 && (
        <ul className="flex flex-col gap-4 mt-6">
          {paginatedData.map((item, index) => {
            const properties = item.properties;
            const website = safeExternalUrl(properties.website);
            const donate = safeExternalUrl(properties.donate);
            return (
              <li
                className="card bg-cardBg text-cardText w-full shadow-xl"
                key={index}
              >
                <div className="card-body">
                  <h3 className="font-headings text-xl">{properties.name}</h3>
                  {typeof item.distance === 'number' && (
                    <p className="text-sm font-semibold -mt-1">
                      {item.distance.toFixed(1)} miles from{' '}
                      {submittedSearchQuery}
                    </p>
                  )}
                  <p>{properties.description}</p>
                  <p>
                    {properties.preciseLocationHidden
                      ? `Based in ${properties.localAuthority || 'this area'} — contact for address`
                      : properties.address}
                  </p>
                  <ul
                    className="flex flex-wrap gap-x-5 gap-y-2 mt-2"
                    aria-label={`Contact ${properties.name}`}
                  >
                    {properties.phone && (
                      <li className="flex items-center gap-2">
                        <AiOutlinePhone aria-hidden="true" />
                        <a
                          className="underline"
                          href={`tel:${properties.phone}`}
                        >
                          {properties.phone}
                        </a>
                      </li>
                    )}
                    {properties.email && (
                      <li className="flex items-center gap-2">
                        <AiOutlineMail aria-hidden="true" />
                        <a
                          className="underline"
                          href={`mailto:${properties.email}`}
                        >
                          Email
                        </a>
                      </li>
                    )}
                    {website && (
                      <li className="flex items-center gap-2">
                        <AiOutlineGlobal aria-hidden="true" />
                        <a
                          className="underline"
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Website
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    )}
                    {donate && (
                      <li className="flex items-center gap-2">
                        <AiOutlineHeart aria-hidden="true" />
                        <a
                          className="underline"
                          href={donate}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Donate
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    )}
                  </ul>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {(Array.isArray(properties.serviceType)
                      ? properties.serviceType
                      : [properties.serviceType]
                    ).map((type, i) => {
                      const Icon = getIconforBadge(type);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-base"
                        >
                          {Icon && (
                            <Icon className="text-lg" aria-hidden="true" />
                          )}
                          {type}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PaginatedList;
