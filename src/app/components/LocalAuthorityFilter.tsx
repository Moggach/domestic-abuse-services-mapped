import React from 'react';

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
    <div>
      <label
        className="mr-4 font-headings text-xl"
        htmlFor="localAuthorityFilter"
      >
        Filter by local authority
      </label>
      <select
        className="select select-bordered w-full max-w-xs mt-2"
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
