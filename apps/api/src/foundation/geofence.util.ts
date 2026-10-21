/**
 * Utilitas Geofencing & Perhitungan Jarak GPS (Formula Haversine).
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Menghitung jarak antara dua koordinat GPS dalam satuan meter menggunakan rumus Haversine.
 * Radius bumi rata-rata = 6,371,000 meter.
 */
export function calculateHaversineDistanceMeters(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;

  const lat1Rad = toRad(point1.latitude);
  const lat2Rad = toRad(point2.latitude);
  const deltaLat = toRad(point2.latitude - point1.latitude);
  const deltaLon = toRad(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMeters * c);
}

/**
 * Memeriksa apakah suatu koordinat berada di dalam radius toleransi cabang (geofence).
 */
export function isWithinGeofence(
  currentLocation: Coordinates,
  branchLocation: Coordinates,
  radiusMeters: number,
): { withinGeofence: boolean; distanceMeters: number } {
  const distanceMeters = calculateHaversineDistanceMeters(currentLocation, branchLocation);
  return {
    withinGeofence: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}
