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

  return (
    <div className="flex flex-col gap-2">
      <span id="specialism-label" className="font-headings text-lg">
        Filter by specialism
      </span>
      <button
        type="button"
        id="specialism-toggle"
        className="select select-bordered w-full max-w-xs mt-2 items-center"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="specialism-options"
        aria-labelledby="specialism-label specialism-toggle"
      >
        {selectedSpecialisms.length > 0 ? (
          <span className="badge badge-accent">
            {selectedSpecialisms.length} selected
          </span>
        ) : (
          'All specialisms'
        )}
      </button>

      {isOpen && (
        <fieldset id="specialism-options" className="mt-2 p-2">
          <legend className="sr-only">Specialisms</legend>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {specialisms.map((specialism) => (
              <li key={specialism}>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedSpecialisms.includes(specialism)}
                    onChange={() => handleCheckboxChange(specialism)}
                  />
                  {specialism}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
    </div>
  );
}
