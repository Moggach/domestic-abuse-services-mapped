import React, { useEffect, useState } from 'react';

import { colorMapping } from '../utils';

interface Properties {
  name: string;
  website: string;
  description: string;
  address: string;
  serviceType: string | string[];
  serviceSpecialism?: string | string[];
}

interface Item {
  properties: Properties;
}

interface PaginationProps {
  data: Item[];
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({
  data,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 mr-2 btn btn-accent text-white font-semibold"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  isMapLoading: boolean;
}

const PaginatedList: React.FC<PaginatedListProps> = ({
  data,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  isMapLoading,

}) => {
  const [paginatedData, setPaginatedData] = useState<Item[]>([]);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setPaginatedData(data.slice(indexOfFirstItem, indexOfLastItem));
  }, [currentPage, data, itemsPerPage]);

  const getColorForBadge = (text: string): string => {
    return colorMapping[text] || 'bg-blue-400 text-white';
  };

  return (
    <div>
      {paginatedData.length > 0 ? (
        <ul className="flex flex-col gap-4 mt-6">
          {paginatedData.map((item, index) => {
            const properties = item.properties;
            return (
              <div
                className="card bg-primary-content w-full shadow-xl"
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
                  <p className="text-base max-w-[75%]">
                    {properties.description}
                  </p>
                  <p className="text-base max-w-[75%]">{properties.address}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Array.isArray(properties.serviceType) ? (
                      properties.serviceType.map((type, i) => (
                        <div
                          key={i}
                          className={`badge ${getColorForBadge(type)} p-5 text-white text-sm`}
                        >
                          {type}
                        </div>
                      ))
                    ) : (
                      <div
                        className={`badge ${getColorForBadge(properties.serviceType)} p-5 text-white`}
                      >
                        {properties.serviceType}
                      </div>
                    )}
                  </div>
                  {properties.serviceSpecialism && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(properties.serviceSpecialism) ? (
                        properties.serviceSpecialism.map((spec, i) => (
                          <div
                            key={i}
                            className={`badge ${getColorForBadge(spec)} p-5 text-sm`}
                          >
                            {spec}
                          </div>
                        ))
                      ) : (
                        <div
                          className={`badge ${getColorForBadge(properties.serviceSpecialism)} p-5 `}
                        >
                          {properties.serviceSpecialism}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </ul>
      ) : isMapLoading ? (
        <p className="text-center text-gray-500 mt-4">Loading services...</p>
      ):
      (
        <p className="text-center text-gray-500 mt-4">
          No items to display. Try removing a filter?
        </p>
      )}
      {data.length > 0 && (
        <Pagination
          data={data}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default PaginatedList;