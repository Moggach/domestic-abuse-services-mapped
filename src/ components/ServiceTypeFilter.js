export default function ServiceTypeFilter({ selectedServiceType, setSelectedServiceType, serviceTypes }) {
    return (
      <div>
        <label htmlFor="serviceFilter">Filter service type</label>
        <select
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
  