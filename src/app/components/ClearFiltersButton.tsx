import React from 'react';

interface ClearFiltersButtonProps {
  onClear: () => void;
}

export default function ClearFiltersButton({ onClear }: ClearFiltersButtonProps) {
  return (
    <button
      className="btn btn-outline btn-secondary mt-2 w-fit"
      onClick={onClear}
    >
      Clear Filters
    </button>
  );
}