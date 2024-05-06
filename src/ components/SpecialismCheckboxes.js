import React from 'react';
import { CheckboxContainer } from '../styles/LayoutStyles';

export default function SpecialismCheckboxes({ specialisms, selectedSpecialisms, setSelectedSpecialisms }) {
  const handleCheckboxChange = (specialism) => {
    const updatedSpecialisms = selectedSpecialisms.includes(specialism)
      ? selectedSpecialisms.filter(s => s !== specialism)
      : [...selectedSpecialisms, specialism];
    setSelectedSpecialisms(updatedSpecialisms);
  };

  return (
    <>
    <CheckboxContainer>
     <div> Select a specialism</div>
     <ul>
      {specialisms.map((specialism, index) => (
        <li key={index}>
          <input
            type="checkbox"
            id={`specialism-${specialism}`}
            checked={selectedSpecialisms.includes(specialism)}
            onChange={() => handleCheckboxChange(specialism)}
          />
          <label htmlFor={`specialism-${specialism}`}>{specialism}</label>
        </li>
      ))}
      </ul>
    </CheckboxContainer>
    </>
  );
}
