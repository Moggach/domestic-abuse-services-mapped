import React from 'react';

export default function SpecialismCheckboxes({ specialisms, selectedSpecialisms, setSelectedSpecialisms }) {
  const handleCheckboxChange = (specialism) => {
    const updatedSpecialisms = selectedSpecialisms.includes(specialism)
      ? selectedSpecialisms.filter(s => s !== specialism)
      : [...selectedSpecialisms, specialism];
    setSelectedSpecialisms(updatedSpecialisms);
  };

  return (
    <>
 

    <div className="collapse collapse-arrow">
       <input type="checkbox" />
       <div className="collapse-title pl-0">Select a specialism</div>
        <ul className="collapse-content flex flex-wrap gap-2 pl-0">

          {specialisms.map((specialism, index) => (
            <li className="flex items-center gap-1" key={index}>

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
      </div>
    </>
  );
}
