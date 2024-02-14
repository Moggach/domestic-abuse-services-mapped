export default function SpecialismCheckboxes({ specialisms, selectedSpecialisms, setSelectedSpecialisms }) {
    const handleCheckboxChange = (specialism) => {
      const updatedSpecialisms = selectedSpecialisms.includes(specialism)
        ? selectedSpecialisms.filter(s => s !== specialism)
        : [...selectedSpecialisms, specialism];
      setSelectedSpecialisms(updatedSpecialisms);
    };
  
    return (
      <div>
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
      </div>
    );
  }
  