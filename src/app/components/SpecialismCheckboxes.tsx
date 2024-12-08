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
    <>
      <div className="collapse collapse-arrow">
        <input type="checkbox" checked={isOpen} onChange={toggleCollapse} />
        <div className="collapse-title pl-0 flex justify-between items-center">
          <div className="indicator">
            {selectedSpecialisms.length > 0 && (
              <span className="indicator-item badge badge-secondary translate-x-5">
                {selectedSpecialisms.length}
              </span>
            )}
            <div className="font-headings flex flex-col md:flex-row gap-2 md:items-center">
              <div className=" text-xl">Select a specialism</div>
              <div>(select all that apply)</div>
            </div>
          </div>
        </div>
        {isOpen && (
          <ul className="collapse-content flex flex-wrap gap-2 pl-0">
            {specialisms.map((specialism, index) => (
              <li className="flex items-center gap-1 text-sm" key={index}>
                <input
                  type="checkbox"
                  className="checkbox"
                  id={`specialism-${specialism}`}
                  checked={selectedSpecialisms.includes(specialism)}
                  onChange={() => handleCheckboxChange(specialism)}
                />
                <label
                  className="label cursor-pointer"
                  htmlFor={`specialism-${specialism}`}
                >
                  {specialism}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
