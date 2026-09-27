import type { FocusEvent, KeyboardEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';

interface SpecialismMultiSelectProps {
  specialisms: string[];
  selectedSpecialisms: string[];
  setSelectedSpecialisms: (specialisms: string[]) => void;
}

const summarise = (selected: string[]): string => {
  if (selected.length === 0) return 'All specialisms';
  if (selected.length === 1) return selected[0];
  return `${selected.length} specialisms selected`;
};

// A button that opens a floating panel of checkboxes (the disclosure
// pattern), which works more reliably with screen readers than an ARIA
// listbox.
export default function SpecialismMultiSelect({
  specialisms,
  selectedSpecialisms,
  setSelectedSpecialisms,
}: SpecialismMultiSelectProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const toggleSpecialism = (specialism: string): void => {
    setSelectedSpecialisms(
      selectedSpecialisms.includes(specialism)
        ? selectedSpecialisms.filter((s) => s !== specialism)
        : [...selectedSpecialisms, specialism]
    );
  };

  // Close when clicking or tapping anywhere outside the dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent): void => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape' && isOpen) {
      // Mark Esc as handled so the Safe exit shortcut ignores it: here it
      // only closes the dropdown, as it does for the safety notice.
      e.preventDefault();
      setIsOpen(false);
      toggleRef.current?.focus();
    }
  };

  // Close when keyboard focus moves out of the dropdown.
  const handleBlur = (e: FocusEvent<HTMLDivElement>): void => {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span id="specialism-label" className="font-headings text-lg">
        Filter by specialism
      </span>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- handles Esc and blur for the controls inside */}
      <div
        ref={containerRef}
        className="relative w-full max-w-xs mt-2"
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <button
          ref={toggleRef}
          type="button"
          id="specialism-toggle"
          className="select select-bordered w-full items-center text-left"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="specialism-options"
          aria-labelledby="specialism-label specialism-toggle"
        >
          <span className="truncate">{summarise(selectedSpecialisms)}</span>
        </button>

        {isOpen && (
          <div
            id="specialism-options"
            className="absolute z-20 mt-1 w-full min-w-[16rem] rounded-box border border-base-300 bg-base-100 shadow-lg"
          >
            <fieldset className="max-h-72 overflow-y-auto p-2">
              <legend className="sr-only">Specialisms</legend>
              <ul className="flex flex-col">
                {specialisms.map((specialism) => (
                  <li key={specialism}>
                    <label className="flex items-center gap-3 rounded-btn px-2 py-2 text-sm cursor-pointer hover:bg-base-200">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-accent"
                        checked={selectedSpecialisms.includes(specialism)}
                        onChange={() => toggleSpecialism(specialism)}
                      />
                      {specialism}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div className="flex justify-between gap-2 border-t border-base-300 p-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedSpecialisms([])}
                disabled={selectedSpecialisms.length === 0}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={() => {
                  setIsOpen(false);
                  toggleRef.current?.focus();
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedSpecialisms.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selected specialisms">
          {selectedSpecialisms.map((specialism) => (
            <li key={specialism}>
              <button
                type="button"
                className="badge badge-accent gap-1 py-3"
                onClick={() => toggleSpecialism(specialism)}
                aria-label={`Remove ${specialism}`}
              >
                {specialism}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
