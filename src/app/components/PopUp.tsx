import mapboxgl from 'mapbox-gl';
import React, { useEffect } from 'react';

import donateIconUrl from '../images/svgs/donate.svg';
import emailIconUrl from '../images/svgs/email.svg';
import phoneIconUrl from '../images/svgs/phone.svg';
import websiteIconUrl from '../images/svgs/website.svg';

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
        .setHTML(
          `
          <div class="pop-up-container">
            <h3 class="popup-title">${name || ''}</h3>
            ${address ? `<div class="pop-up-item">${address}</div>` : ''}
            ${phone ? `<div class="pop-up-item"><img src="${phoneIconUrl.src}" alt="Phone" style="height: 15px;"/><a href="tel:${phone}" style="text-decoration: none; color: inherit;"> ${phone}</a></div>` : ''}
            ${email ? `<div class="pop-up-item"><img src="${emailIconUrl.src}" alt="Email" style="height: 15px;"/><a href="mailto:${email}" style="text-decoration: none; color: inherit;"> Email</a></div>` : ''}
            ${website ? `<div class="pop-up-item"><img src="${websiteIconUrl.src}" alt="Website" style="height: 15px;"/> <a href="${website}" target="_blank" rel="noopener noreferrer">Website</a></div>` : ''}
            ${donate ? `<div class="pop-up-item"><img src="${donateIconUrl.src}" alt="Donate" style="height: 15px;"/>  <a href="${donate}" target="_blank" rel="noopener noreferrer">Donate</a></div>` : ''}
          </div>
        `
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
