import mapboxgl from 'mapbox-gl';
import type React from 'react';
import { useEffect } from 'react';

import donateIconUrl from '../images/svgs/donate.svg';
import emailIconUrl from '../images/svgs/email.svg';
import phoneIconUrl from '../images/svgs/phone.svg';
import websiteIconUrl from '../images/svgs/website.svg';
import { safeExternalUrl } from '../lib/urls';

interface PopUpProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  coordinates: [number, number];
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  donate?: string;
}

// Service data comes from submissions, so the popup is built from DOM nodes
// with textContent rather than an HTML string, and links are validated.
const createLinkItem = (
  iconSrc: string,
  href: string,
  text: string,
  external: boolean
): HTMLDivElement => {
  const item = document.createElement('div');
  item.className = 'pop-up-item';

  const icon = document.createElement('img');
  icon.src = iconSrc;
  icon.alt = '';
  icon.className = 'popup-icon';

  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  } else {
    link.className = 'popup-link';
    link.style.color = 'inherit';
  }

  item.append(icon, link);
  return item;
};

const createPopupContent = ({
  name,
  address,
  phone,
  email,
  website,
  donate,
}: Omit<PopUpProps, 'map' | 'coordinates'>): HTMLDivElement => {
  const container = document.createElement('div');
  container.className = 'pop-up-container';

  const title = document.createElement('h3');
  title.className = 'popup-title';
  title.textContent = name || '';
  container.append(title);

  if (address) {
    const item = document.createElement('div');
    item.className = 'pop-up-item';
    item.textContent = address;
    container.append(item);
  }
  if (phone) {
    container.append(
      createLinkItem(phoneIconUrl.src, `tel:${phone}`, phone, false)
    );
  }
  if (email) {
    container.append(
      createLinkItem(emailIconUrl.src, `mailto:${email}`, 'Email', false)
    );
  }
  const safeWebsite = safeExternalUrl(website);
  if (safeWebsite) {
    container.append(
      createLinkItem(websiteIconUrl.src, safeWebsite, 'Website', true)
    );
  }
  const safeDonate = safeExternalUrl(donate);
  if (safeDonate) {
    container.append(
      createLinkItem(donateIconUrl.src, safeDonate, 'Donate', true)
    );
  }

  return container;
};

const PopUp: React.FC<PopUpProps> = ({
  map,
  coordinates,
  name,
  address,
  phone,
  email,
  website,
  donate,
}) => {
  useEffect(() => {
    if (map.current && coordinates) {
      const popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setDOMContent(
          createPopupContent({ name, address, phone, email, website, donate })
        )
        .addTo(map.current);
      return () => {
        popup.remove();
      };
    }
  }, [map, coordinates, name, address, phone, email, website, donate]);

  return null;
};

export default PopUp;
