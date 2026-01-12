// @ts-nocheck
/**
 * ClusteredMapView - Map with marker clustering for vendor/restaurant locations
 * Uses expo-maps and supercluster for performance with large marker sets
 */
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ExpoMap, Marker, type CameraPosition } from 'expo-maps';
import { useColors } from '@/hooks/use-colors';
import { useMapClustering, type MarkerData, type ClusterPoint } from '@/hooks/use-map-clustering';
import { Text } from '@/components/ui/text';

interface ClusteredMapViewProps {
  /** Array of markers to display/cluster */
  markers: MarkerData[];
  /** Initial camera position */
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  /** Callback when marker is pressed */
  onMarkerPress?: (marker: MarkerData) => void;
  /** Callback when cluster is pressed */
  onClusterPress?: (cluster: ClusterPoint) => void;
  /** Map height */
  height?: number;
  /** Cluster radius in pixels */
  clusterRadius?: number;
}

// Default Lusaka coordinates
const DEFAULT_LOCATION = {
  latitude: -15.3875,
  longitude: 28.3228,
};

export function ClusteredMapView({
  markers = [],
  initialRegion = {
    ...DEFAULT_LOCATION,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  onMarkerPress,
  onClusterPress,
  height = 400,
  clusterRadius = 60,
}: ClusteredMapViewProps) {
  const mapRef = useRef<any>(null);
  const colors = useColors();
  
  const [mapBounds, setMapBounds] = useState({
    northEast: {
      latitude: initialRegion.latitude + (initialRegion.latitudeDelta || 0.1) / 2,
      longitude: initialRegion.longitude + (initialRegion.longitudeDelta || 0.1) / 2,
    },
    southWest: {
      latitude: initialRegion.latitude - (initialRegion.latitudeDelta || 0.1) / 2,
      longitude: initialRegion.longitude - (initialRegion.longitudeDelta || 0.1) / 2,
    },
  });
  
  const [zoom, setZoom] = useState(12);

  // Initialize clustering
  const { getClusters, getClusterExpansionZoom } = useMapClustering(markers, {
    radius: clusterRadius,
    maxZoom: 16,
    minPoints: 2,
  });

  // Get clusters for current viewport
  const clusters = getClusters(mapBounds, zoom);

  // Calculate zoom level from delta
  const getZoom = (delta: number) => {
    return Math.min(18, Math.max(10, Math.round(Math.log(360 / delta) / Math.LN2)));
  };

  const initialZoom = getZoom(initialRegion.latitudeDelta || 0.1);

  // Initial camera position
  const initialCamera: CameraPosition = {
    center: {
      latitude: initialRegion.latitude,
      longitude: initialRegion.longitude,
    },
    zoom: initialZoom,
  };

  // Handle region change to update clusters
  const handleRegionChange = (region: any) => {
    // Update bounds and zoom for clustering
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    
    setMapBounds({
      northEast: {
        latitude: latitude + latitudeDelta / 2,
        longitude: longitude + longitudeDelta / 2,
      },
      southWest: {
        latitude: latitude - latitudeDelta / 2,
        longitude: longitude - longitudeDelta / 2,
      },
    });
    
    setZoom(getZoom(latitudeDelta));
  };

  // Handle cluster press - zoom in to expand
  const handleClusterPress = (cluster: ClusterPoint) => {
    if (!cluster.properties.cluster) {
      // It's a single marker
      const markerData = markers.find(m => m.id === cluster.properties.id);
      if (markerData && onMarkerPress) {
        onMarkerPress(markerData);
      }
      return;
    }

    // Get expansion zoom level
    const expansionZoom = getClusterExpansionZoom(cluster.properties.cluster_id!);
    
    // Animate to cluster location with new zoom
    mapRef.current?.animateCamera({
      center: {
        latitude: cluster.geometry.coordinates[1],
        longitude: cluster.geometry.coordinates[0],
      },
      zoom: expansionZoom,
      duration: 500,
    });

    if (onClusterPress) {
      onClusterPress(cluster);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <ExpoMap
        ref={mapRef}
        style={styles.map}
        initialCameraPosition={initialCamera}
        provider="google"
        gestureHandling="greedy"
        mapType="standard"
        onRegionChangeComplete={handleRegionChange}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const isCluster = cluster.properties.cluster;
          const pointCount = cluster.properties.point_count;

          if (isCluster) {
            // Render cluster marker
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                coordinate={{ latitude, longitude }}
                onPress={() => handleClusterPress(cluster)}
              >
                <View
                  style={[
                    styles.clusterMarker,
                    {
                      backgroundColor: colors.primary,
                      width: getClusterSize(pointCount),
                      height: getClusterSize(pointCount),
                    },
                  ]}
                >
                  <Text style={styles.clusterText}>{pointCount}</Text>
                </View>
              </Marker>
            );
          }

          // Render individual marker
          return (
            <Marker
              key={`marker-${cluster.properties.id}`}
              coordinate={{ latitude, longitude }}
              title={cluster.properties.name}
              description={cluster.properties.address}
              pinColor={colors.primary}
              onPress={() => handleClusterPress(cluster)}
            />
          );
        })}
      </ExpoMap>
    </View>
  );
}

// Calculate cluster marker size based on point count
function getClusterSize(pointCount: number): number {
  if (pointCount < 10) return 40;
  if (pointCount < 50) return 50;
  if (pointCount < 100) return 60;
  return 70;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
  },
  map: {
    flex: 1,
  },
  clusterMarker: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
