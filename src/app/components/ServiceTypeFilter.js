export default function ServiceTypeFilter({
  selectedServiceType,
  setSelectedServiceType,
  serviceTypes,
}) {
  return (
    <div>
      <label className="mr-4 font-headings text-xl" htmlFor="serviceFilter">
        Filter by service type
      </label>
      <select
        className="select select-bordered w-full max-w-xs mt-2"
        id="serviceFilter"
        value={selectedServiceType}
        onChange={(e) => setSelectedServiceType(e.target.value)}
      >
        <option value="">All service types</option>
        {serviceTypes.map((serviceType, index) => (
          <option key={index} value={serviceType}>
            {serviceType}
          </option>
        ))}
      </select>
    </div>
  );
}
