import React from 'react';
import mapboxgl from 'mapbox-gl';
import { GlobalStyles } from '../styles/LayoutStyles'; 

import phoneIconUrl from '../images/svgs/phone.svg';
import websiteIconUrl from '../images/svgs/website.svg';
import emailIconUrl from '../images/svgs/email.svg';
import donateIconUrl from '../images/svgs/donate.svg';

const PopUp = ({ map, coordinates, name, address, phone, website, email, donate }) => {
    React.useEffect(() => {
        if (map.current && coordinates) {
            let htmlContent = `
            <div class="pop-up-container">
            <h3 class="popup-title">${name}</h3>`
           
            if (address) {
                htmlContent +=  `<div class="pop-up-itemt">${address}</div>`;
            }
            if (phone) {
                htmlContent += `<div class="pop-up-item"><img src="${phoneIconUrl}" alt="Phone" style="height: 15px;"/><a href="tel:${phone}" style="text-decoration: none; color: inherit;"> ${phone}</a></div>`;
            }
            if (email) {
                htmlContent += `<div class="pop-up-item"><img src="${emailIconUrl}" alt="Email" style="height: 15px;"/><a href="mailto:${email}" style="text-decoration: none; color: inherit;"> ${email}</a></div>`;
            }
            if (website) {
                htmlContent += `<div class="pop-up-item"><img src="${websiteIconUrl}" alt="Website" style="height: 15px;"/> <a href="${website}" target="_blank">${website}</a></div>`;
            }
        
            if (donate) {
                htmlContent += `<div class="pop-up-item"><img src="${donateIconUrl}" alt="Donate" style="height: 15px;"/>  <a href="${donate}" target="_blank">${donate}</a></div>`;
            }
            htmlContent += `</div>`;

            const popup = new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(htmlContent)
                .addTo(map.current);

            return () => popup.remove();
        }
    }, [map, coordinates, name, address, phone, website, email, donate]);

    return <GlobalStyles />;
};

export default PopUp;
