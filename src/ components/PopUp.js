import React from 'react';
import mapboxgl from 'mapbox-gl';

const PopUp = ({ map, coordinates, name, address }) => {
    React.useEffect(() => {
        if (map.current && coordinates) {
            const popup = new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`<h3>${name}</h3><p>${address}</p>`)
                .addTo(map.current);

            return () => popup.remove();
        }
    }, [map, coordinates, name, address]);

    return null;
};
export default PopUp