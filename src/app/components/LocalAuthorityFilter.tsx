import React, { useState } from 'react';

import { fetchLocalAuthority } from '../utils';

interface LocalAuthorityFilterProps {
  selectedLocalAuthority: string;
  setSelectedLocalAuthority: (value: string) => void;
  localAuthorities: string[];
}

export default function LocalAuthorityFilter({
  localAuthorities,
  selectedLocalAuthority,
  setSelectedLocalAuthority,
}: LocalAuthorityFilterProps): JSX.Element {
  const [postcode, setPostcode] = useState('');
  const [laResult, setLaResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPostcodeLookup, setShowPostcodeLookup] = useState(false);

  const handlePostcodeLookup = async () => {
    setLoading(true);
    setError(null);
    setLaResult(null);
    try {
      const result = await fetchLocalAuthority(postcode);
      if (result) {
        setLaResult(result);
      } else {
        setError('No local authority found for this postcode.');
      }
    } catch (e) {
      setError('Error looking up local authority.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <label
        className="mr-4 font-headings text-lg mb-3"
        htmlFor="localAuthorityFilter"
      >
        Filter by local authority
      </label>
      <div className="mb-3">
        <button
          type="button"
          className=" underline focus:outline-none mb-3 flex items-center gap-2"
          onClick={() => setShowPostcodeLookup((prev) => !prev)}
        >
          What is my local authority?
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              d="m165.33 113.44a103.61 103.61 0 1 1 -207.22 0 103.61 103.61 0 1 1 207.22 0z"
              fill="#fff"
            />
            <g>
              <path d="M100 0c-55.2 0-100 44.8-100 100C0 155.2 44.8 200 100 200s100-44.8 100-100S155.2 0 100 0zm0 12.812c48.13 0 87.19 39.058 87.19 87.188s-39.06 87.19-87.19 87.19-87.188-39.06-87.188-87.19S51.87 12.812 100 12.812zm1.47 21.25c-5.45.03-10.653.737-15.282 2.063-4.699 1.346-9.126 3.484-12.876 6.219-3.238 2.362-6.333 5.391-8.687 8.531-4.159 5.549-6.461 11.651-7.063 18.687-.04.468-.07.868-.062.876.016.016 21.702 2.687 21.812 2.687.053 0 .113-.234.282-.937 1.941-8.085 5.486-13.521 10.968-16.813 4.32-2.594 9.808-3.612 15.778-2.969 2.74.295 5.21.96 7.38 2 2.71 1.301 5.18 3.361 6.94 5.813 1.54 2.156 2.46 4.584 2.75 7.312.08.759.05 2.48-.03 3.219-.23 1.826-.7 3.378-1.5 4.969-.81 1.597-1.48 2.514-2.76 3.812-2.03 2.077-5.18 4.829-10.78 9.407-3.6 2.944-6.04 5.156-8.12 7.343-4.943 5.179-7.191 9.069-8.564 14.719-.905 3.72-1.256 7.55-1.156 13.19.025 1.4.062 2.73.062 2.97v.43h21.598l.03-2.4c.03-3.27.21-5.37.56-7.41.57-3.27 1.43-5 3.94-7.81 1.6-1.8 3.7-3.76 6.93-6.47 4.77-3.991 8.11-6.99 11.26-10.125 4.91-4.907 7.46-8.26 9.28-12.187 1.43-3.092 2.22-6.166 2.46-9.532.06-.816.07-3.03 0-3.968-.45-7.043-3.1-13.253-8.15-19.032-.8-.909-2.78-2.887-3.72-3.718-4.96-4.394-10.69-7.353-17.56-9.094-4.19-1.062-8.23-1.6-13.35-1.75-.78-.023-1.59-.036-2.37-.032zm-10.908 103.6v22h21.998v-22h-21.998z" />
            </g>
          </svg>
        </button>
      </div>
      <div>
        {showPostcodeLookup && (
          <div className="mb-6 flex flex-col gap-4 w-full max-w-md border select-bordered p-3 rounded-xl">
            <div className="text-sm font-medium mb-1">
              Find your local authority by entering your postcode:
            </div>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow bg-transparent focus:outline-none"
                placeholder="Enter postcode"
                value={postcode}
                onChange={(e) => {
                  setPostcode(e.target.value);
                  if (e.target.value.trim() === '') {
                    setLaResult(null);
                    setError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePostcodeLookup();
                }}
              />
              <button
                onClick={handlePostcodeLookup}
                aria-label="Search"
                disabled={loading || !postcode.trim()}
                className="hover:text-blue-600"
              >
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
              {postcode && (
                <button
                  onClick={() => {
                    setPostcode('');
                    setLaResult(null);
                    setError(null);
                  }}
                  aria-label="Clear postcode"
                  className="hover:text-red-600"
                >
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
            {laResult && (
              <div className="text-sm mb-2 font-semibold">
                Your local authority is {laResult}
              </div>
            )}
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          </div>
        )}
      </div>
      <select
        className="select select-bordered w-full max-w-xs"
        id="localAuthorityFilter"
        value={selectedLocalAuthority}
        onChange={(e) => setSelectedLocalAuthority(e.target.value)}
      >
        <option value="">All local authorities</option>
        {localAuthorities
          .slice()
          .sort((a, b) => a.localeCompare(b))
          .map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
      </select>
    </div>
  );
}
