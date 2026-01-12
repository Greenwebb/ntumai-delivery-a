// @ts-nocheck
/**
 * GoogleMapsService - Integration with real Google Maps APIs
 * Supports Directions, Places, Geocoding, and Distance Matrix APIs
 */

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RoutePolyline {
  points: LatLng[];
  distance: number; // meters
  duration: number; // seconds
  bounds: {
    northeast: LatLng;
    southwest: LatLng;
  };
}

export interface DirectionsResult {
  routes: RoutePolyline[];
  status: string;
}

export interface PlaceAutocomplete {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
  phoneNumber?: string;
  rating?: number;
  photos?: string[];
}

export interface GeocodingResult {
  address: string;
  location: LatLng;
  placeId: string;
  formattedAddress: string;
}

export interface DistanceMatrixResult {
  distance: number; // meters
  duration: number; // seconds
  distanceText: string; // "5.2 km"
  durationText: string; // "15 mins"
}

class GoogleMapsService {
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  /**
   * Decode Google polyline string to array of coordinates
   */
  private decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  }

  /**
   * Get directions between two points using Google Directions API
   */
  async getDirections(
    origin: LatLng,
    destination: LatLng,
    waypoints?: LatLng[]
  ): Promise<DirectionsResult> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      let url = `${this.baseUrl}/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`;
      
      // Add waypoints if provided
      if (waypoints && waypoints.length > 0) {
        const waypointsStr = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');
        url += `&waypoints=${waypointsStr}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Directions API error:', data.status);
        throw new Error(`Directions API error: ${data.status}`);
      }

      const routes: RoutePolyline[] = data.routes.map((route: any) => {
        const leg = route.legs[0];
        const polyline = route.overview_polyline.points;
        
        return {
          points: this.decodePolyline(polyline),
          distance: leg.distance.value,
          duration: leg.duration.value,
          bounds: {
            northeast: {
              latitude: route.bounds.northeast.lat,
              longitude: route.bounds.northeast.lng,
            },
            southwest: {
              latitude: route.bounds.southwest.lat,
              longitude: route.bounds.southwest.lng,
            },
          },
        };
      });

      return {
        routes,
        status: data.status,
      };
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw error;
    }
  }

  /**
   * Search places using Google Places Autocomplete API
   */
  async searchPlaces(query: string, location?: LatLng): Promise<PlaceAutocomplete[]> {
    try {
      let url = `${this.baseUrl}/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      if (location) {
        url += `&location=${location.latitude},${location.longitude}&radius=50000`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Places API error:', data.status);
        return [];
      }

      return data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Place Details API error:', data.status);
        return null;
      }

      const place = data.result;
      
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        phoneNumber: place.formatted_phone_number,
        rating: place.rating,
        photos: place.photos?.map((photo: any) => 
          `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        ),
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(location: LatLng): Promise<GeocodingResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?latlng=${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Geocoding API error:', data.status);
        return null;
      }

      const result = data.results[0];
      
      return {
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Forward geocode address to coordinates
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Geocoding API error:', data.status);
        return null;
      }

      const result = data.results[0];
      
      return {
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }

  /**
   * Calculate distance and duration between two points
   */
  async getDistanceMatrix(
    origins: LatLng[],
    destinations: LatLng[]
  ): Promise<DistanceMatrixResult[][]> {
    try {
      const originsStr = origins
        .map(o => `${o.latitude},${o.longitude}`)
        .join('|');
      const destinationsStr = destinations
        .map(d => `${d.latitude},${d.longitude}`)
        .join('|');
      
      const url = `${this.baseUrl}/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Distance Matrix API error:', data.status);
        throw new Error(`Distance Matrix API error: ${data.status}`);
      }

      return data.rows.map((row: any) => 
        row.elements.map((element: any) => ({
          distance: element.distance.value,
          duration: element.duration.value,
          distanceText: element.distance.text,
          durationText: element.duration.text,
        }))
      );
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      throw error;
    }
  }

  /**
   * Calculate ETA based on distance and current traffic
   */
  async calculateETA(origin: LatLng, destination: LatLng): Promise<{
    distance: number;
    duration: number;
    eta: Date;
  }> {
    try {
      const matrix = await this.getDistanceMatrix([origin], [destination]);
      const result = matrix[0][0];
      
      const eta = new Date();
      eta.setSeconds(eta.getSeconds() + result.duration);
      
      return {
        distance: result.distance,
        duration: result.duration,
        eta,
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
