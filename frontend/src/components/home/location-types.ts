export type LocationData = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours?: string | null;
};

export type NearbyPlace = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  latitude: number;
  longitude: number;
};

export type RouteData = {
  distanceMeters: number;
  durationSeconds: number;

  /**
   * Leaflet format:
   * [latitude, longitude]
   */
  coordinates: [number, number][];
};

export type RouteApiResponse = {
  distanceMeters: number;
  durationSeconds: number;

  /**
   * OSRM / GeoJSON format:
   * [longitude, latitude]
   */
  coordinates: [number, number][];
};