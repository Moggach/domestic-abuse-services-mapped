import React, { useState } from 'react';

export default function SpecialismCheckboxes({ specialisms, selectedSpecialisms, setSelectedSpecialisms }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (specialism) => {
    const updatedSpecialisms = selectedSpecialisms.includes(specialism)
      ? selectedSpecialisms.filter(s => s !== specialism)
      : [...selectedSpecialisms, specialism];
    setSelectedSpecialisms(updatedSpecialisms);
  };

  const toggleCollapse = () => {
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
            <span className='font-headings text-xl'>Select a specialism</span>
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
                <label className="label cursor-pointer" htmlFor={`specialism-${specialism}`}>{specialism}</label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
