import { TrackingData, Location } from '../../components/tracking-map';

/**
 * Mock locations in Lusaka, Zambia
 */
export const MOCK_LOCATIONS: Record<string, Location> = {
  MANDA_HILL: {
    latitude: -15.3982,
    longitude: 28.3132,
    address: 'Manda Hill Shopping Mall, Great East Road',
  },
  ARCADES: {
    latitude: -15.4024,
    longitude: 28.3265,
    address: 'Arcades Shopping Centre, Great East Road',
  },
  LEVY_JUNCTION: {
    latitude: -15.4156,
    longitude: 28.2821,
    address: 'Levy Junction Mall, Church Road',
  },
  EAST_PARK: {
    latitude: -15.4089,
    longitude: 28.3412,
    address: 'East Park Mall, Thabo Mbeki Road',
  },
  CAIRO_ROAD: {
    latitude: -15.4167,
    longitude: 28.2833,
    address: 'Cairo Road, Central Business District',
  },
  KABULONGA: {
    latitude: -15.4312,
    longitude: 28.3156,
    address: 'Kabulonga Shopping Centre',
  },
  WOODLANDS: {
    latitude: -15.4234,
    longitude: 28.3078,
    address: 'Woodlands Extension, Lusaka',
  },
  ROMA: {
    latitude: -15.3945,
    longitude: 28.2987,
    address: 'Roma Township, Lusaka',
  },
};

/**
 * Mock tracking data for different delivery scenarios
 */
export const MOCK_TRACKING_DATA: TrackingData[] = [
  {
    taskerLocation: {
      latitude: -15.4012,
      longitude: 28.3198,
      address: 'En route on Great East Road',
    },
    pickupLocation: MOCK_LOCATIONS.MANDA_HILL,
    dropoffLocation: MOCK_LOCATIONS.KABULONGA,
    status: 'heading_to_pickup',
    estimatedArrival: '5 mins',
    taskerName: 'John Banda',
    taskerPhone: '+260971234567',
    taskerRating: 4.8,
    vehicleType: 'Motorcycle',
  },
  {
    taskerLocation: MOCK_LOCATIONS.ARCADES,
    pickupLocation: MOCK_LOCATIONS.ARCADES,
    dropoffLocation: MOCK_LOCATIONS.WOODLANDS,
    status: 'at_pickup',
    estimatedArrival: '12 mins',
    taskerName: 'Mary Mwanza',
    taskerPhone: '+260972345678',
    taskerRating: 4.9,
    vehicleType: 'Bicycle',
  },
  {
    taskerLocation: {
      latitude: -15.4178,
      longitude: 28.3012,
      address: 'Near Levy Junction',
    },
    pickupLocation: MOCK_LOCATIONS.LEVY_JUNCTION,
    dropoffLocation: MOCK_LOCATIONS.EAST_PARK,
    status: 'heading_to_dropoff',
    estimatedArrival: '8 mins',
    taskerName: 'Peter Phiri',
    taskerPhone: '+260973456789',
    taskerRating: 4.7,
    vehicleType: 'Car',
  },
  {
    taskerLocation: MOCK_LOCATIONS.ROMA,
    pickupLocation: MOCK_LOCATIONS.CAIRO_ROAD,
    dropoffLocation: MOCK_LOCATIONS.ROMA,
    status: 'at_dropoff',
    estimatedArrival: 'Arrived',
    taskerName: 'Grace Tembo',
    taskerPhone: '+260974567890',
    taskerRating: 5.0,
    vehicleType: 'Motorcycle',
  },
];

/**
 * Get mock tracking data by index
 */
export function getMockTrackingData(index: number = 0): TrackingData {
  return MOCK_TRACKING_DATA[index % MOCK_TRACKING_DATA.length];
}

/**
 * Simulate tasker movement along a route
 * Returns a function that updates the tasker location over time
 */
export function simulateTaskerMovement(
  initialData: TrackingData,
  onUpdate: (data: TrackingData) => void,
  intervalMs: number = 3000
): () => void {
  let currentData = { ...initialData };
  let step = 0;
  const totalSteps = 10;

  const targetLocation = 
    currentData.status === 'heading_to_pickup' || currentData.status === 'at_pickup'
      ? currentData.pickupLocation
      : currentData.dropoffLocation;

  const latStep = (targetLocation.latitude - currentData.taskerLocation.latitude) / totalSteps;
  const lngStep = (targetLocation.longitude - currentData.taskerLocation.longitude) / totalSteps;

  const interval = setInterval(() => {
    step++;

    if (step >= totalSteps) {
      // Arrived at destination
      currentData = {
        ...currentData,
        taskerLocation: targetLocation,
        status: currentData.status === 'heading_to_pickup' ? 'at_pickup' : 'at_dropoff',
        estimatedArrival: 'Arrived',
      };
      clearInterval(interval);
    } else {
      // Update position
      currentData = {
        ...currentData,
        taskerLocation: {
          latitude: currentData.taskerLocation.latitude + latStep,
          longitude: currentData.taskerLocation.longitude + lngStep,
          address: 'En route...',
        },
        estimatedArrival: `${Math.ceil((totalSteps - step) * (intervalMs / 60000))} mins`,
      };
    }

    onUpdate(currentData);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Generate random tracking data for testing
 */
export function generateRandomTrackingData(): TrackingData {
  const locationKeys = Object.keys(MOCK_LOCATIONS);
  const pickupKey = locationKeys[Math.floor(Math.random() * locationKeys.length)];
  let dropoffKey = locationKeys[Math.floor(Math.random() * locationKeys.length)];
  
  // Ensure different pickup and dropoff
  while (dropoffKey === pickupKey) {
    dropoffKey = locationKeys[Math.floor(Math.random() * locationKeys.length)];
  }

  const pickupLocation = MOCK_LOCATIONS[pickupKey];
  const dropoffLocation = MOCK_LOCATIONS[dropoffKey];

  // Generate tasker location between pickup and dropoff
  const progress = Math.random();
  const taskerLocation: Location = {
    latitude: pickupLocation.latitude + (dropoffLocation.latitude - pickupLocation.latitude) * progress,
    longitude: pickupLocation.longitude + (dropoffLocation.longitude - pickupLocation.longitude) * progress,
    address: 'En route...',
  };

  const statuses: TrackingData['status'][] = ['heading_to_pickup', 'at_pickup', 'heading_to_dropoff', 'at_dropoff'];
  const vehicleTypes = ['Motorcycle', 'Bicycle', 'Car', 'Van'];
  const names = ['John Banda', 'Mary Mwanza', 'Peter Phiri', 'Grace Tembo', 'David Mulenga', 'Sarah Chanda'];

  return {
    taskerLocation,
    pickupLocation,
    dropoffLocation,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    estimatedArrival: `${Math.floor(Math.random() * 20) + 5} mins`,
    taskerName: names[Math.floor(Math.random() * names.length)],
    taskerPhone: `+26097${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    taskerRating: 4.5 + Math.random() * 0.5,
    vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
  };
}

export default {
  MOCK_LOCATIONS,
  MOCK_TRACKING_DATA,
  getMockTrackingData,
  simulateTaskerMovement,
  generateRandomTrackingData,
};
