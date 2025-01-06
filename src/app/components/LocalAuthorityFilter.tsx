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
    <div className="flex flex-col gap-3">
      <label
        className="mr-4 font-headings text-xl"
        htmlFor="localAuthorityFilter"
      >
        Filter by local authority
      </label>

      <div>
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
        {localAuthorities.map((item, index) => (
          <option key={index} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
