interface Coordinates {
  latitude: number;
  longitude: number;
}

export const fetchCoordinates = async (
  postcode: string
): Promise<Coordinates | null> => {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${postcode}`
    );
    const data = await response.json();
    if (data.status === 200) {
      const { latitude, longitude } = data.result;
      return { latitude, longitude };
    } else {
      console.error('Invalid postcode');
      return null;
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

export const fetchLocalAuthority = async (
  postcode: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${postcode}`
    );
    const data = await response.json();
    if (data.status === 200) {
      const local_authority: string = data.result.admin_district;
      return local_authority;
    } else {
      console.error('Invalid postcode');
      return null;
    }
  } catch (error) {
    console.error('Error fetching local authority:', error);
    return null;
  }
};
