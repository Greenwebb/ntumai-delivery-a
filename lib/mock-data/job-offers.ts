import { JobOffer } from '@/components/job-offer-modal';

/**
 * Mock job offers for testing the JobOfferModal
 */
export const MOCK_JOB_OFFERS: JobOffer[] = [
  {
    id: 'job_001',
    type: 'delivery',
    title: 'Package Delivery',
    description: 'Deliver a small package from sender to recipient',
    pickupAddress: '123 Cairo Road, Lusaka',
    dropoffAddress: '456 Independence Avenue, Lusaka',
    estimatedEarnings: 45.00,
    estimatedDistance: '5.2 km',
    estimatedDuration: '15 min',
    customerName: 'John M.',
    customerRating: 4.8,
    urgency: 'normal',
  },
  {
    id: 'job_002',
    type: 'marketplace',
    title: 'Grocery Pickup',
    description: 'Pick up groceries from Fresh Mart and deliver to customer',
    pickupAddress: 'Fresh Mart, Manda Hill',
    dropoffAddress: '789 Woodlands, Lusaka',
    estimatedEarnings: 65.00,
    estimatedDistance: '8.5 km',
    estimatedDuration: '25 min',
    customerName: 'Sarah K.',
    customerRating: 4.9,
    items: ['Tomatoes', 'Bread', 'Milk', 'Eggs'],
    urgency: 'express',
  },
  {
    id: 'job_003',
    type: 'errand',
    title: 'Document Collection',
    description: 'Collect documents from office and deliver to home address',
    pickupAddress: 'ABC Company, Great East Road',
    dropoffAddress: '321 Kabulonga, Lusaka',
    estimatedEarnings: 55.00,
    estimatedDistance: '6.8 km',
    estimatedDuration: '20 min',
    customerName: 'Peter N.',
    customerRating: 4.7,
    urgency: 'normal',
  },
];

/**
 * Simulate receiving a new job offer
 * In production, this would come from WebSocket/Push notification
 */
export function simulateJobOffer(callback: (offer: JobOffer) => void): () => void {
  const randomDelay = Math.random() * 10000 + 5000; // 5-15 seconds
  
  const timeout = setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_JOB_OFFERS.length);
    const offer = {
      ...MOCK_JOB_OFFERS[randomIndex],
      id: `job_${Date.now()}`, // Generate unique ID
    };
    callback(offer);
  }, randomDelay);

  return () => clearTimeout(timeout);
}

/**
 * Get a specific mock job offer by ID
 */
export function getMockJobOffer(id: string): JobOffer | undefined {
  return MOCK_JOB_OFFERS.find(offer => offer.id === id);
}

/**
 * Generate a random job offer for testing
 */
export function generateRandomJobOffer(): JobOffer {
  const types: JobOffer['type'][] = ['delivery', 'marketplace', 'errand'];
  const urgencies: JobOffer['urgency'][] = ['normal', 'express'];
  
  const pickupLocations = [
    'Cairo Road, Lusaka',
    'Manda Hill Shopping Mall',
    'Levy Junction',
    'East Park Mall',
    'Arcades Shopping Centre',
  ];
  
  const dropoffLocations = [
    'Woodlands, Lusaka',
    'Kabulonga, Lusaka',
    'Roma, Lusaka',
    'Chilenje, Lusaka',
    'Olympia Park, Lusaka',
  ];
  
  const customerNames = ['John M.', 'Sarah K.', 'Peter N.', 'Mary C.', 'David L.'];
  
  return {
    id: `job_${Date.now()}`,
    type: types[Math.floor(Math.random() * types.length)],
    title: 'New Delivery Request',
    description: 'A customer needs your help with a delivery',
    pickupAddress: pickupLocations[Math.floor(Math.random() * pickupLocations.length)],
    dropoffAddress: dropoffLocations[Math.floor(Math.random() * dropoffLocations.length)],
    estimatedEarnings: Math.floor(Math.random() * 80) + 30, // 30-110
    estimatedDistance: `${(Math.random() * 10 + 2).toFixed(1)} km`,
    estimatedDuration: `${Math.floor(Math.random() * 30) + 10} min`,
    customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
    customerRating: Math.round((Math.random() * 1 + 4) * 10) / 10, // 4.0-5.0
    urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
  };
}
