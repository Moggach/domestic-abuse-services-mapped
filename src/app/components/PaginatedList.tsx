import React, { useEffect, useState, useRef } from 'react';
import type { IconType } from 'react-icons';
import { AiOutlinePhone, AiOutlineMail } from 'react-icons/ai';

import { iconMapping } from '../utils';

interface Properties {
  name: string;
  website: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  serviceType: string | string[];
  serviceSpecialism?: string | string[];
}

interface Item {
  properties: Properties;
  distance?: number;
}

interface PaginationProps {
  data: Item[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  data,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  return (
    <div className="flex justify-center items-center mt-8">
      <button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 mr-2 btn btn-accent text-white font-semibold"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 ml-2 btn btn-accent font-semibold text-white"
      >
        Next
      </button>
    </div>
  );
};

interface PaginatedListProps {
  data: Item[];
  filteredData: Item[];
  filteredDataWithDistance: Item[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  isMapLoading: boolean;
  searchSubmitted: boolean;
  submittedSearchQuery: string;
  isPostcode: (input: string) => boolean;
  radius: number;
}

const PaginatedList: React.FC<PaginatedListProps> = ({
  data,
  filteredData,
  filteredDataWithDistance,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  isMapLoading,
  searchSubmitted,
  submittedSearchQuery,
  isPostcode,
  radius,
}) => {
  const [paginatedData, setPaginatedData] = useState<Item[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setPaginatedData(data.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, data, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);

    const isMobile = window.innerWidth < 768;
    if (isMobile && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const getIconforBadge = (text: string): IconType | null => {
    return iconMapping[text] || null;
  };

  return (
    <div>
      {isMapLoading ? (
        <p className="text-center text-gray-500 mt-4">Loading services...</p>
      ) : searchSubmitted ? (
        <div className="mt-2">
          {submittedSearchQuery ? (
            isPostcode(submittedSearchQuery) ? (
              filteredDataWithDistance.length > 0 ? (
                <h2>
                  Showing {filteredDataWithDistance.length}{' '}
                  {filteredDataWithDistance.length === 1
                    ? 'service'
                    : 'services'}{' '}
                  within {radius} miles of postcode &quot;
                  {submittedSearchQuery}&quot;:
                </h2>
              ) : (
                <h2>
                  No search results within {radius} miles of postcode &quot;
                  {submittedSearchQuery}&quot;. Try another search or remove any
                  filters?
                </h2>
              )
            ) : filteredData.length > 0 ? (
              <h2>
                Showing services matching &quot;{submittedSearchQuery}&quot;:
              </h2>
            ) : (
              <h2>
                No services found matching &quot;{submittedSearchQuery}&quot;.
                Try another search or remove any filters?
              </h2>
            )
          ) : (
            <h2>Please enter a search query.</h2>
          )}
        </div>
      ) : null}

      {paginatedData.length > 0 && !isMapLoading && (
        <div ref={listRef}>
          <ul className="flex flex-col gap-4 mt-6">
            {paginatedData.map((item, index) => {
              const properties = item.properties;
              return (
                <div
                  className="card bg-cardBg text-cardText w-full shadow-xl"
                  key={index}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <h3 className="font-headings text-xl max-w-[80%]">
                        {properties.name}
                      </h3>
                      <a href={properties.website}>
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 512 512"
                          height="20px"
                          width="20px"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path>
                        </svg>
                      </a>
                    </div>
                    <p>{properties.description}</p>
                    <p>{properties.address}</p>
                    <div className="flex flex-col text-sm gap-2">
                      <div className="flex flex-col gap-3 mt-2">
                        {properties.phone && (
                          <div className="flex items-center gap-2">
                            <AiOutlinePhone className="text-base" />
                            <a
                              href={`tel:${properties.phone}`}
                              className="no-underline text-inherit"
                            >
                              {properties.phone}
                            </a>
                          </div>
                        )}
                        {properties.email && (
                          <div className="flex items-center gap-2">
                            <AiOutlineMail className="text-base" />
                            <a
                              href={`mailto:${properties.email}`}
                              className="no-underline text-inherit"
                            >
                              Email
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
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
                            {Icon && <Icon className="text-lg" />}
                            {type}
                          </div>
                        );
                      })}
                    </div>
                    {typeof item.distance === 'number' && (
                      <span className="text-sm mt-1">
                        {item.distance.toFixed(2)} miles from{' '}
                        {submittedSearchQuery}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </ul>
        </div>
      )}

      <Pagination
        data={data}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
      />
    </div>
  );
};

export default PaginatedList;
