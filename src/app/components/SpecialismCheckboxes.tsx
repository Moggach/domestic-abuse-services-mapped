import React, { useState } from 'react';

interface SpecialismCheckboxesProps {
  specialisms: string[];
  selectedSpecialisms: string[];
  setSelectedSpecialisms: (specialisms: string[]) => void;
}

export default function SpecialismCheckboxes({
  specialisms,
  selectedSpecialisms,
  setSelectedSpecialisms,
}: SpecialismCheckboxesProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleCheckboxChange = (specialism: string): void => {
    const updatedSpecialisms = selectedSpecialisms.includes(specialism)
      ? selectedSpecialisms.filter((s) => s !== specialism)
      : [...selectedSpecialisms, specialism];
    setSelectedSpecialisms(updatedSpecialisms);
  };

  const toggleCollapse = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="">
      <div
        className="select  select-bordered flex justify-between items-center cursor-pointer"
        onClick={toggleCollapse}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCollapse();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        <h3 className="text-md font-headings">Select a specialism</h3>
        {selectedSpecialisms.length > 0 && (
          <span className="badge badge-secondary">
            {selectedSpecialisms.length} selected
          </span>
        )}
      </div>

      {isOpen && (
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2">
          {specialisms.map((specialism, index) => (
            <li key={index} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                className="checkbox"
                id={`specialism-${specialism}`}
                checked={selectedSpecialisms.includes(specialism)}
                onChange={() => handleCheckboxChange(specialism)}
              />
              <label
                className="cursor-pointer"
                htmlFor={`specialism-${specialism}`}
              >
                {specialism}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
