import * as FileSystem from 'expo-file-system/legacy';
import type { LatLng } from 'expo-maps';

/**
 * Offline Map Tile Caching Service
 * Caches map tiles for offline use in areas with poor connectivity
 */

const CACHE_DIR = `${FileSystem.cacheDirectory}map-tiles/`;
const MAX_CACHE_SIZE_MB = 100; // Maximum cache size in megabytes
const TILE_SIZE = 256; // Standard tile size in pixels
const MAX_ZOOM = 18; // Maximum zoom level to cache

interface CachedTile {
  url: string;
  path: string;
  size: number;
  timestamp: number;
  zoom: number;
  x: number;
  y: number;
}

interface CacheMetadata {
  tiles: CachedTile[];
  totalSize: number;
  lastCleanup: number;
}

class MapCacheService {
  private metadata: CacheMetadata = {
    tiles: [],
    totalSize: 0,
    lastCleanup: Date.now(),
  };

  private metadataPath = `${CACHE_DIR}metadata.json`;
  private initialized = false;

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Load metadata
      const metadataInfo = await FileSystem.getInfoAsync(this.metadataPath);
      if (metadataInfo.exists) {
        const content = await FileSystem.readAsStringAsync(this.metadataPath);
        this.metadata = JSON.parse(content);
      }

      this.initialized = true;
      console.log('[MapCache] Initialized with', this.metadata.tiles.length, 'cached tiles');
    } catch (error) {
      console.error('[MapCache] Initialization error:', error);
      this.initialized = true; // Continue anyway
    }
  }

  /**
   * Convert lat/lng to tile coordinates
   */
  private latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n
    );
    return { x, y };
  }

  /**
   * Generate tile URL for Google Maps
   */
  private getTileUrl(x: number, y: number, zoom: number): string {
    // Google Maps tile URL format
    return `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${zoom}`;
  }

  /**
   * Get cached tile path
   */
  private getTilePath(x: number, y: number, zoom: number): string {
    return `${CACHE_DIR}${zoom}-${x}-${y}.png`;
  }

  /**
   * Download and cache a single tile
   */
  private async cacheTile(x: number, y: number, zoom: number): Promise<boolean> {
    try {
      const url = this.getTileUrl(x, y, zoom);
      const path = this.getTilePath(x, y, zoom);

      // Check if already cached
      const existing = this.metadata.tiles.find(
        (t) => t.x === x && t.y === y && t.zoom === zoom
      );
      if (existing) {
        return true; // Already cached
      }

      // Download tile
      const downloadResult = await FileSystem.downloadAsync(url, path);
      
      if (downloadResult.status !== 200) {
        console.warn('[MapCache] Failed to download tile:', x, y, zoom);
        return false;
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(path);
      const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

      // Add to metadata
      const tile: CachedTile = {
        url,
        path,
        size,
        timestamp: Date.now(),
        zoom,
        x,
        y,
      };

      this.metadata.tiles.push(tile);
      this.metadata.totalSize += size;

      // Check cache size limit
      await this.enforceSizeLimit();

      return true;
    } catch (error) {
      console.error('[MapCache] Error caching tile:', error);
      return false;
    }
  }

  /**
   * Cache tiles for a specific region
   */
  async cacheRegion(
    center: LatLng,
    radiusKm: number,
    minZoom: number = 10,
    maxZoom: number = 15
  ): Promise<{ success: number; failed: number }> {
    await this.initialize();

    let success = 0;
    let failed = 0;

    try {
      // Calculate tile range for each zoom level
      for (let zoom = minZoom; zoom <= Math.min(maxZoom, MAX_ZOOM); zoom++) {
        const centerTile = this.latLngToTile(center.latitude, center.longitude, zoom);
        
        // Calculate how many tiles to cache based on radius
        const tilesPerKm = Math.pow(2, zoom) / 40075; // Earth circumference
        const tileRadius = Math.ceil(radiusKm * tilesPerKm);

        // Cache tiles in a square around the center
        for (let dx = -tileRadius; dx <= tileRadius; dx++) {
          for (let dy = -tileRadius; dy <= tileRadius; dy++) {
            const x = centerTile.x + dx;
            const y = centerTile.y + dy;

            // Check if within circle
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= tileRadius) {
              const result = await this.cacheTile(x, y, zoom);
              if (result) {
                success++;
              } else {
                failed++;
              }
            }
          }
        }
      }

      // Save metadata
      await this.saveMetadata();

      console.log(`[MapCache] Cached ${success} tiles, ${failed} failed`);
    } catch (error) {
      console.error('[MapCache] Error caching region:', error);
    }

    return { success, failed };
  }

  /**
   * Get cached tile if available
   */
  async getCachedTile(lat: number, lng: number, zoom: number): Promise<string | null> {
    await this.initialize();

    const { x, y } = this.latLngToTile(lat, lng, zoom);
    const tile = this.metadata.tiles.find(
      (t) => t.x === x && t.y === y && t.zoom === zoom
    );

    if (!tile) return null;

    // Check if file still exists
    const fileInfo = await FileSystem.getInfoAsync(tile.path);
    if (!fileInfo.exists) {
      // Remove from metadata
      this.metadata.tiles = this.metadata.tiles.filter((t) => t !== tile);
      await this.saveMetadata();
      return null;
    }

    return tile.path;
  }

  /**
   * Enforce cache size limit by removing oldest tiles
   */
  private async enforceSizeLimit(): Promise<void> {
    const maxSizeBytes = MAX_CACHE_SIZE_MB * 1024 * 1024;

    while (this.metadata.totalSize > maxSizeBytes && this.metadata.tiles.length > 0) {
      // Sort by timestamp (oldest first)
      this.metadata.tiles.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest tile
      const oldest = this.metadata.tiles.shift();
      if (!oldest) break;

      try {
        await FileSystem.deleteAsync(oldest.path, { idempotent: true });
        this.metadata.totalSize -= oldest.size;
      } catch (error) {
        console.error('[MapCache] Error deleting tile:', error);
      }
    }
  }

  /**
   * Clear all cached tiles
   */
  async clearCache(): Promise<void> {
    await this.initialize();

    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      
      this.metadata = {
        tiles: [],
        totalSize: 0,
        lastCleanup: Date.now(),
      };

      await this.saveMetadata();
      console.log('[MapCache] Cache cleared');
    } catch (error) {
      console.error('[MapCache] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    tileCount: number;
    totalSizeMB: number;
    maxSizeMB: number;
    usagePercent: number;
  }> {
    await this.initialize();

    const totalSizeMB = this.metadata.totalSize / (1024 * 1024);
    const usagePercent = (totalSizeMB / MAX_CACHE_SIZE_MB) * 100;

    return {
      tileCount: this.metadata.tiles.length,
      totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
      maxSizeMB: MAX_CACHE_SIZE_MB,
      usagePercent: parseFloat(usagePercent.toFixed(2)),
    };
  }

  /**
   * Save metadata to disk
   */
  private async saveMetadata(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        this.metadataPath,
        JSON.stringify(this.metadata)
      );
    } catch (error) {
      console.error('[MapCache] Error saving metadata:', error);
    }
  }

  /**
   * Preload common delivery zones
   */
  async preloadDeliveryZones(zones: Array<{ name: string; center: LatLng; radiusKm: number }>): Promise<void> {
    console.log(`[MapCache] Preloading ${zones.length} delivery zones...`);

    for (const zone of zones) {
      console.log(`[MapCache] Caching zone: ${zone.name}`);
      await this.cacheRegion(zone.center, zone.radiusKm, 12, 16);
    }

    console.log('[MapCache] Preloading complete');
  }
}

// Export singleton instance
export const mapCacheService = new MapCacheService();
