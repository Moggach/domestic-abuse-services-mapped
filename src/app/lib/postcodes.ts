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

export type PostcodeLookup =
  | { status: 'found'; postcode: string; latitude: number; longitude: number }
  | { status: 'not_found' }
  | { status: 'error' };

/**
 * Like fetchCoordinates, but tells a postcode that doesn't exist apart from
 * a failed request, so the UI can show the right message.
 */
export const lookupPostcode = async (
  postcode: string
): Promise<PostcodeLookup> => {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`
    );
    if (response.status === 404) return { status: 'not_found' };
    const data = await response.json();
    if (data.status !== 200) return { status: 'error' };
    const { postcode: formatted, latitude, longitude } = data.result;
    return { status: 'found', postcode: formatted, latitude, longitude };
  } catch {
    return { status: 'error' };
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
