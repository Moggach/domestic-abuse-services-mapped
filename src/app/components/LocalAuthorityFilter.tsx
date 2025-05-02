import React from 'react';
import Link from 'next/link';

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
  return (
    <div className="flex flex-col">
      <label
        className="mr-4 font-headings text-lg mb-3"
        htmlFor="localAuthorityFilter"
      >
        Filter by local authority
      </label>

      <div className="mb-3">
        <Link
          className="text-sm underline"
          href="https://www.gov.uk/find-local-council"
        >
          What is my local authority?
        </Link>
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
