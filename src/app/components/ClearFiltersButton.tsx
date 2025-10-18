import React from 'react';

interface ClearFiltersButtonProps {
  onClear: () => void;
}

export default function ClearFiltersButton({
  onClear,
}: ClearFiltersButtonProps): JSX.Element {
  return (
    <button
      className="btn mt-2 w-fit btn btn-accent text-white font-semibold"
      onClick={onClear}
    >
      Clear Filters
    </button>
  );
}
