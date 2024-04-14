import React, { useState } from 'react';
import { CheckboxContainer } from '../styles/LayoutStyles';

export default function SpecialismCheckboxes({ specialisms, selectedSpecialisms, setSelectedSpecialisms }) {
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  const handleCheckboxChange = (specialism) => {
    const updatedSpecialisms = selectedSpecialisms.includes(specialism)
      ? selectedSpecialisms.filter(s => s !== specialism)
      : [...selectedSpecialisms, specialism];
    setSelectedSpecialisms(updatedSpecialisms);
  };

  const toggleCheckboxes = () => {
    setShowCheckboxes(!showCheckboxes);
  };

  return (
    <div>
      <button onClick={toggleCheckboxes}>
        {showCheckboxes ? 'Hide Specialisms' : 'Show Specialisms'}
      </button>
      {showCheckboxes && (
        <CheckboxContainer>
          {specialisms.map((specialism, index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`specialism-${specialism}`}
                checked={selectedSpecialisms.includes(specialism)}
                onChange={() => handleCheckboxChange(specialism)}
              />
              <label htmlFor={`specialism-${specialism}`}>{specialism}</label>
            </div>
          ))}
        </CheckboxContainer>
        
            )}
    </div>
  );
}
