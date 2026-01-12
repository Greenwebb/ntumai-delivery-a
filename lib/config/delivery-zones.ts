/**
 * Delivery Zones Configuration
 * Defines geographic zones for delivery operations in Lusaka, Zambia
 */

export interface DeliveryZone {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in kilometers
  priority: 'high' | 'medium' | 'low';
  deliveryFee: number; // in ZMW
}

/**
 * Delivery zones in Lusaka
 * Coordinates are approximate centers of major areas
 */
export const deliveryZones: DeliveryZone[] = [
  // High Priority Zones (City Center & CBD)
  {
    id: 'zone-cbd',
    name: 'CBD & City Center',
    center: { latitude: -15.4167, longitude: 28.2833 },
    radius: 3,
    priority: 'high',
    deliveryFee: 15,
  },
  {
    id: 'zone-kabulonga',
    name: 'Kabulonga',
    center: { latitude: -15.3833, longitude: 28.3167 },
    radius: 2.5,
    priority: 'high',
    deliveryFee: 20,
  },
  {
    id: 'zone-rhodes-park',
    name: 'Rhodes Park',
    center: { latitude: -15.3917, longitude: 28.3083 },
    radius: 2,
    priority: 'high',
    deliveryFee: 18,
  },

  // Medium Priority Zones
  {
    id: 'zone-chelston',
    name: 'Chelston',
    center: { latitude: -15.3667, longitude: 28.3333 },
    radius: 3,
    priority: 'medium',
    deliveryFee: 25,
  },
  {
    id: 'zone-woodlands',
    name: 'Woodlands',
    center: { latitude: -15.4333, longitude: 28.3167 },
    radius: 2.5,
    priority: 'medium',
    deliveryFee: 22,
  },
  {
    id: 'zone-roma',
    name: 'Roma',
    center: { latitude: -15.4500, longitude: 28.2667 },
    radius: 2,
    priority: 'medium',
    deliveryFee: 20,
  },
  {
    id: 'zone-northmead',
    name: 'Northmead',
    center: { latitude: -15.3833, longitude: 28.2667 },
    radius: 2.5,
    priority: 'medium',
    deliveryFee: 23,
  },

  // Low Priority Zones (Outer Areas)
  {
    id: 'zone-garden',
    name: 'Garden',
    center: { latitude: -15.4667, longitude: 28.3000 },
    radius: 3,
    priority: 'low',
    deliveryFee: 30,
  },
  {
    id: 'zone-kalingalinga',
    name: 'Kalingalinga',
    center: { latitude: -15.3667, longitude: 28.3667 },
    radius: 2.5,
    priority: 'low',
    deliveryFee: 28,
  },
  {
    id: 'zone-mtendere',
    name: 'Mtendere',
    center: { latitude: -15.4000, longitude: 28.3833 },
    radius: 3,
    priority: 'low',
    deliveryFee: 32,
  },
];

/**
 * Get high priority zones for map caching
 */
export function getHighPriorityZones(): DeliveryZone[] {
  return deliveryZones.filter((zone) => zone.priority === 'high');
}

/**
 * Get all zones for a specific priority level
 */
export function getZonesByPriority(priority: 'high' | 'medium' | 'low'): DeliveryZone[] {
  return deliveryZones.filter((zone) => zone.priority === priority);
}

/**
 * Find the zone that contains a given location
 */
export function findZoneForLocation(latitude: number, longitude: number): DeliveryZone | null {
  for (const zone of deliveryZones) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.center.latitude,
      zone.center.longitude
    );
    if (distance <= zone.radius) {
      return zone;
    }
  }
  return null;
}

/**
 * Calculate delivery fee for a location
 */
export function calculateDeliveryFee(latitude: number, longitude: number): number {
  const zone = findZoneForLocation(latitude, longitude);
  if (zone) {
    return zone.deliveryFee;
  }
  // Default fee for areas outside defined zones
  return 40;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get all zone names for display
 */
export function getZoneNames(): string[] {
  return deliveryZones.map((zone) => zone.name);
}

/**
 * Get zone by ID
 */
export function getZoneById(id: string): DeliveryZone | undefined {
  return deliveryZones.find((zone) => zone.id === id);
}
