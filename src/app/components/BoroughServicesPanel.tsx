import type React from 'react';
import type { IconType } from 'react-icons';
import { AiOutlinePhone, AiOutlineMail } from 'react-icons/ai';

import type { Feature } from '../App';
import { iconMapping } from '../utils';

interface BoroughServicesPanelProps {
  borough: string | null;
  services: Feature[];
}

const getIconForBadge = (text: string): IconType | null => {
  return iconMapping[text] || null;
};

const ServiceCard: React.FC<{ item: Feature }> = ({ item }) => {
  const properties = item.properties;

  return (
    <li className="border-t select-bordered pt-4 first:border-t-0 first:pt-0">
      <h4 className="font-headings text-base">{properties.name}</h4>
      <p className="text-sm">{properties.description}</p>
      <p className="text-sm mt-1">
        {properties.preciseLocationHidden
          ? 'Contact for address'
          : properties.address}
      </p>
      <div className="flex flex-col text-sm gap-2 mt-2">
        {properties.phone && (
          <div className="flex items-center gap-2">
            <AiOutlinePhone className="text-base" />
            <a
              href={`tel:${properties.phone}`}
              className="no-underline text-inherit"
            >
              {properties.phone}
            </a>
          </div>
        )}
        {properties.email && (
          <div className="flex items-center gap-2">
            <AiOutlineMail className="text-base" />
            <a
              href={`mailto:${properties.email}`}
              className="no-underline text-inherit"
            >
              Email
            </a>
          </div>
        )}
        {properties.website && (
          <a
            href={properties.website}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-inherit"
          >
            Website
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {(Array.isArray(properties.serviceType)
          ? properties.serviceType
          : [properties.serviceType]
        ).map((type, i) => {
          const Icon = getIconForBadge(type);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              {Icon && <Icon className="text-base" />}
              {type}
            </div>
          );
        })}
      </div>
    </li>
  );
};

const BoroughServicesPanel: React.FC<BoroughServicesPanelProps> = ({
  borough,
  services,
}) => {
  if (!borough) return null;

  const exactLocationServices = services.filter(
    (item) => !item.properties.preciseLocationHidden
  );
  const approximateLocationServices = services.filter(
    (item) => item.properties.preciseLocationHidden
  );

  return (
    <div className="h-full flex flex-col border select-bordered rounded-2xl p-4 bg-cardBg text-cardText shadow-xl">
      <h3 className="font-headings text-lg mb-1">Services in {borough}</h3>

      {services.length === 0 ? (
        <p className="text-sm">No services listed here.</p>
      ) : (
        <div className="overflow-y-auto flex-1 min-h-0">
          {exactLocationServices.length > 0 && (
            <div className="mb-4">
              <h4 className="font-headings text-sm uppercase tracking-wide opacity-75 mb-2">
                Services with an address
              </h4>
              <ul className="flex flex-col gap-4">
                {exactLocationServices.map((item, index) => (
                  <ServiceCard key={index} item={item} />
                ))}
              </ul>
            </div>
          )}

          {approximateLocationServices.length > 0 && (
            <div>
              <h4 className="font-headings text-sm uppercase tracking-wide opacity-75 mb-2">
                Services covering this area
              </h4>
              <p className="text-sm mb-2 opacity-75">
                These services don&apos;t share an exact address — contact them
                directly for details.
              </p>
              <ul className="flex flex-col gap-4">
                {approximateLocationServices.map((item, index) => (
                  <ServiceCard key={index} item={item} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoroughServicesPanel;
