
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodedAddress {
  address: string;
  coords: Coordinates;
  distance: number; // Distance from reference point in km
  originalIndex: number;
}

// Garage Location: Rehov Kombe 12, Hadera
export const GARAGE_LOCATION: Coordinates = {
  lat: 32.4618,
  lng: 34.9390,
};

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Geocodes an address using OpenStreetMap (Nominatim).
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const query = address.toLowerCase().includes('israel') || address.includes('ישראל')
      ? address
      : `${address}, ישראל`;
      
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ToyotaSOS-DriverApp/1.0',
        'Accept-Language': 'he,en',
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Sorts stops based on their proximity to a reference point.
 * Returns the sorted items with geocoding metadata (lat, lng, distance).
 */
export async function optimizeRoute<T>(
  stops: T[],
  addressExtractor: (item: T) => string,
  referencePoint: Coordinates = GARAGE_LOCATION
): Promise<{ item: T; geocode: GeocodedAddress | null }[]> {
  // 1. Geocode all addresses
  const results = await Promise.all(
    stops.map(async (item, index) => {
      const address = addressExtractor(item);
      if (!address) return { item, geocode: null };
      
      const coords = await geocodeAddress(address);
      if (coords) {
        return {
          item,
          geocode: {
            address,
            coords,
            distance: calculateDistance(referencePoint, coords),
            originalIndex: index,
          },
        };
      }
      return { item, geocode: null };
    })
  );

  // Separate valid and invalid
  const valid = results.filter((r): r is { item: T; geocode: GeocodedAddress } => r.geocode !== null);
  const invalid = results.filter((r) => r.geocode === null);

  // Sort valid by distance
  valid.sort((a, b) => a.geocode.distance - b.geocode.distance);

  return [...valid, ...invalid];
}

/**
 * Helper to format distance for display (e.g., "1.2 km" or "500 m")
 */
export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} מ׳`;
  }
  return `${km.toFixed(1)} ק״מ`;
}
