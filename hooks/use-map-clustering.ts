// @ts-nocheck
/**
 * useMapClustering - Hook for clustering map markers using supercluster
 * Dynamically clusters markers based on zoom level and viewport
 */
import { useMemo, useState, useEffect } from 'react';
import Supercluster from 'supercluster';

export interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  [key: string]: any; // Additional marker properties
}

export interface ClusterPoint {
  type: 'Feature';
  id: number | string;
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    // Original marker data
    id?: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, longitude];
  };
}

interface UseMapClusteringOptions {
  /** Cluster radius in pixels */
  radius?: number;
  /** Maximum zoom level for clustering */
  maxZoom?: number;
  /** Minimum zoom level */
  minZoom?: number;
  /** Minimum points to form a cluster */
  minPoints?: number;
}

export function useMapClustering(
  markers: MarkerData[],
  options: UseMapClusteringOptions = {}
) {
  const {
    radius = 60,
    maxZoom = 16,
    minZoom = 0,
    minPoints = 2,
  } = options;

  // Initialize supercluster
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius,
      maxZoom,
      minZoom,
      minPoints,
    });

    // Convert markers to GeoJSON features
    const points: ClusterPoint[] = markers.map((marker) => ({
      type: 'Feature',
      id: marker.id,
      properties: {
        cluster: false,
        ...marker,
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude],
      },
    }));

    cluster.load(points);
    return cluster;
  }, [markers, radius, maxZoom, minZoom, minPoints]);

  /**
   * Get clusters for current map viewport
   */
  const getClusters = (
    bounds: {
      northEast: { latitude: number; longitude: number };
      southWest: { latitude: number; longitude: number };
    },
    zoom: number
  ): ClusterPoint[] => {
    if (!supercluster) return [];

    const bbox: [number, number, number, number] = [
      bounds.southWest.longitude,
      bounds.southWest.latitude,
      bounds.northEast.longitude,
      bounds.northEast.latitude,
    ];

    return supercluster.getClusters(bbox, Math.floor(zoom));
  };

  /**
   * Get individual markers within a cluster
   */
  const getClusterExpansionZoom = (clusterId: number): number => {
    if (!supercluster) return maxZoom;
    return supercluster.getClusterExpansionZoom(clusterId);
  };

  /**
   * Get leaves (individual points) of a cluster
   */
  const getClusterLeaves = (
    clusterId: number,
    limit: number = 10,
    offset: number = 0
  ): ClusterPoint[] => {
    if (!supercluster) return [];
    return supercluster.getLeaves(clusterId, limit, offset);
  };

  return {
    getClusters,
    getClusterExpansionZoom,
    getClusterLeaves,
    supercluster,
  };
}
