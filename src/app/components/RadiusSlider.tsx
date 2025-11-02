import React from 'react';

interface RadiusSliderProps {
  radius: number;
  setRadius: (value: number) => void;
  min?: number;
  max?: number;
}

const RadiusSlider: React.FC<RadiusSliderProps> = ({
  radius,
  setRadius,
  min = 1,
  max = 10,
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor="radius-slider" className="font-headings text-lg">
      Search radius: {radius} miles
    </label>
    <input
      id="radius-slider"
      type="range"
      min={min}
      max={max}
      value={radius}
      onChange={(e) => setRadius(Number(e.target.value))}
    />
  </div>
);

export default RadiusSlider;
