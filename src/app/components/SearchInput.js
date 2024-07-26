import React, { useState } from 'react';

const isValidUKPostcode = (postcode) => {
  const postcodeRegex = /^([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}|GIR\s?0AA)$/i;
  return postcodeRegex.test(postcode.trim());
};

export default function SearchInput({ searchQuery, setSearchQuery, onSubmit, onClear }) {
  const [error, setError] = useState('');

  const handleClear = () => {
    setSearchQuery('');
    onClear();
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidUKPostcode(searchQuery)) {
      onSubmit(searchQuery);
      setError('');
    } else {
      setError('Please enter a valid UK postcode');
    }
  };

  return (
    <div>
      <label className="font-semibold text-xl" htmlFor="searchInput">Search by location </label>
      <label className="input input-bordered flex items-center gap-2 mt-2">
        <input
          type="text"
          className="grow"
          placeholder="Enter your postcode"
          id="searchInput"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSubmit} aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {searchQuery && (
          <button onClick={handleClear} aria-label="Clear search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M3.646 3.646a.5.5 0 0 1 .708 0L8 7.293l3.646-3.647a.5.5 0 0 1 .708.708L8.707 8l3.647 3.646a.5.5 0 0 1-.708.708L8 8.707l-3.646 3.647a.5.5 0 0 1-.708-.708L7.293 8 3.646 4.354a.5.5 0 0 1 0-.708z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </label>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

