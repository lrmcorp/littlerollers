import {
  calculateHaversineDistanceMeters,
  isWithinGeofence,
  type Coordinates,
} from './geofence.util';

describe('geofence.util', () => {
  // Green Garden Jakarta reference point
  const branchCoords: Coordinates = { latitude: -6.1685, longitude: 106.7628 };

  describe('calculateHaversineDistanceMeters', () => {
    it('returns 0 when coordinates are identical', () => {
      const distance = calculateHaversineDistanceMeters(branchCoords, branchCoords);
      expect(distance).toBe(0);
    });

    it('accurately calculates distance for nearby points (~110 meters)', () => {
      // 0.001 deg latitude is roughly 111 meters
      const nearby: Coordinates = {
        latitude: branchCoords.latitude + 0.001,
        longitude: branchCoords.longitude,
      };
      const distance = calculateHaversineDistanceMeters(branchCoords, nearby);
      expect(distance).toBeGreaterThanOrEqual(105);
      expect(distance).toBeLessThanOrEqual(115);
    });

    it('calculates long distance across cities correctly (~120 km Jakarta to Bandung)', () => {
      const bandungCoords: Coordinates = { latitude: -6.9175, longitude: 107.6191 };
      const distance = calculateHaversineDistanceMeters(branchCoords, bandungCoords);
      // Roughly 124,000 meters
      expect(distance).toBeGreaterThan(100_000);
      expect(distance).toBeLessThan(150_000);
    });
  });

  describe('isWithinGeofence', () => {
    it('permits check-in within standard 200m radius', () => {
      const nearbyPoint: Coordinates = {
        latitude: branchCoords.latitude + 0.0005, // ~55m away
        longitude: branchCoords.longitude,
      };
      const result = isWithinGeofence(nearbyPoint, branchCoords, 200);
      expect(result.withinGeofence).toBe(true);
      expect(result.distanceMeters).toBeLessThanOrEqual(200);
    });

    it('rejects check-in outside radius (>200m)', () => {
      const distantPoint: Coordinates = {
        latitude: branchCoords.latitude + 0.003, // ~330m away
        longitude: branchCoords.longitude,
      };
      const result = isWithinGeofence(distantPoint, branchCoords, 200);
      expect(result.withinGeofence).toBe(false);
      expect(result.distanceMeters).toBeGreaterThan(200);
    });
  });
});
