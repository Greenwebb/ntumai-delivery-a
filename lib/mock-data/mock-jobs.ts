// @ts-nocheck
/**
 * Mock Jobs Data (Tasker)
 */

export type JobType = 'delivery' | 'errand' | 'marketplace';
export type JobStatus = 'available' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type JobUrgency = 'normal' | 'express';

export interface MockJob {
  id: string;
  type: JobType;
  title: string;
  description: string;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedEarnings: number;
  estimatedDistance: string;
  estimatedDuration: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  urgency: JobUrgency;
  status: JobStatus;
  taskerId?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Mock jobs database
 */
const MOCK_JOBS: MockJob[] = [
  {
    id: 'job_001',
    type: 'delivery',
    title: 'Food Delivery - Hungry Lion',
    description: 'Pick up order from Hungry Lion and deliver to customer',
    pickupAddress: 'Hungry Lion, Cairo Road, Lusaka',
    dropoffAddress: 'Plot 123, Kabulonga Road, Lusaka',
    estimatedEarnings: 25,
    estimatedDistance: '3.5 km',
    estimatedDuration: '20 mins',
    customerName: 'Demo Customer',
    customerPhone: '+260 97 123 4567',
    customerRating: 4.8,
    urgency: 'normal',
    status: 'available',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  },
  {
    id: 'job_002',
    type: 'delivery',
    title: 'Pizza Delivery - Debonairs',
    description: 'Pick up pizza order and deliver',
    pickupAddress: 'Debonairs Pizza, Manda Hill, Lusaka',
    dropoffAddress: 'Plot 456, Roma, Lusaka',
    estimatedEarnings: 35,
    estimatedDistance: '5.2 km',
    estimatedDuration: '25 mins',
    customerName: 'Sarah Phiri',
    customerPhone: '+260 97 234 5678',
    customerRating: 4.5,
    urgency: 'express',
    status: 'available',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    expiresAt: new Date(Date.now() + 8 * 60 * 1000),
  },
  {
    id: 'job_003',
    type: 'errand',
    title: 'Grocery Shopping',
    description: 'Buy groceries from Shoprite and deliver',
    pickupAddress: 'Shoprite, Arcades, Lusaka',
    dropoffAddress: 'Plot 789, Chelston, Lusaka',
    estimatedEarnings: 40,
    estimatedDistance: '4.8 km',
    estimatedDuration: '35 mins',
    customerName: 'James Mulenga',
    customerPhone: '+260 97 345 6789',
    customerRating: 4.9,
    urgency: 'normal',
    status: 'available',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    expiresAt: new Date(Date.now() + 20 * 60 * 1000),
  },
];

/**
 * Get available jobs
 */
export async function mockGetAvailableJobs(): Promise<MockJob[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_JOBS.filter(job => job.status === 'available')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get job by ID
 */
export async function mockGetJob(jobId: string): Promise<MockJob | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_JOBS.find(job => job.id === jobId) || null;
}

/**
 * Accept job
 */
export async function mockAcceptJob(jobId: string, taskerId: string): Promise<MockJob> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const job = MOCK_JOBS.find(j => j.id === jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  if (job.status !== 'available') {
    throw new Error('Job is no longer available');
  }
  
  job.status = 'accepted';
  job.taskerId = taskerId;
  
  return job;
}

/**
 * Start job
 */
export async function mockStartJob(jobId: string): Promise<MockJob> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const job = MOCK_JOBS.find(j => j.id === jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  job.status = 'in_progress';
  
  return job;
}

/**
 * Complete job
 */
export async function mockCompleteJob(jobId: string): Promise<MockJob> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const job = MOCK_JOBS.find(j => j.id === jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  job.status = 'completed';
  
  return job;
}

/**
 * Get tasker's active jobs
 */
export async function mockGetTaskerJobs(taskerId: string): Promise<MockJob[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_JOBS.filter(job => job.taskerId === taskerId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get tasker earnings
 */
export async function mockGetTaskerEarnings(taskerId: string): Promise<{
  today: number;
  week: number;
  month: number;
  total: number;
}> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const completedJobs = MOCK_JOBS.filter(
    job => job.taskerId === taskerId && job.status === 'completed'
  );
  
  const total = completedJobs.reduce((sum, job) => sum + job.estimatedEarnings, 0);
  
  return {
    today: 125,
    week: 450,
    month: 1850,
    total,
  };
}
