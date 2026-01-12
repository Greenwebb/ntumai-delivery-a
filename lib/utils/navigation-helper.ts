/**
 * NavigationHelper - Deep linking to Google Maps and Waze
 * Allows taskers to open navigation apps for turn-by-turn directions
 */
import { Platform, Linking, Alert } from 'react-native';

export interface NavigationDestination {
  latitude: number;
  longitude: number;
  address?: string;
  label?: string;
}

export class NavigationHelper {
  /**
   * Open Google Maps with directions to destination
   */
  static async openGoogleMaps(destination: NavigationDestination): Promise<boolean> {
    const { latitude, longitude, label } = destination;
    
    let url: string;
    
    if (Platform.OS === 'ios') {
      // iOS Google Maps URL scheme
      url = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
      
      // Fallback to Apple Maps if Google Maps not installed
      const fallbackUrl = `maps://app?daddr=${latitude},${longitude}`;
      
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return true;
        } else {
          // Open Apple Maps as fallback
          await Linking.openURL(fallbackUrl);
          return true;
        }
      } catch (error) {
        console.error('Error opening Google Maps:', error);
        return false;
      }
    } else {
      // Android Google Maps intent
      url = `google.navigation:q=${latitude},${longitude}&mode=d`;
      
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return true;
        } else {
          // Fallback to web Google Maps
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          await Linking.openURL(webUrl);
          return true;
        }
      } catch (error) {
        console.error('Error opening Google Maps:', error);
        return false;
      }
    }
  }

  /**
   * Open Waze with directions to destination
   */
  static async openWaze(destination: NavigationDestination): Promise<boolean> {
    const { latitude, longitude } = destination;
    
    const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        // Waze not installed
        Alert.alert(
          'Waze Not Installed',
          'Please install Waze from the App Store or Play Store to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Install',
              onPress: () => {
                const storeUrl = Platform.OS === 'ios'
                  ? 'https://apps.apple.com/app/waze-navigation-live-traffic/id323229106'
                  : 'https://play.google.com/store/apps/details?id=com.waze';
                Linking.openURL(storeUrl);
              },
            },
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error opening Waze:', error);
      return false;
    }
  }

  /**
   * Show navigation options to user (Google Maps or Waze)
   */
  static showNavigationOptions(destination: NavigationDestination): void {
    const { address, label } = destination;
    const destinationName = label || address || 'destination';
    
    Alert.alert(
      'Navigate to ' + destinationName,
      'Choose your preferred navigation app',
      [
        {
          text: 'Google Maps',
          onPress: () => this.openGoogleMaps(destination),
        },
        {
          text: 'Waze',
          onPress: () => this.openWaze(destination),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Get estimated travel time using Google Distance Matrix API (mock for now)
   */
  static async getEstimatedTravelTime(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<{ duration: number; distance: number } | null> {
    // TODO: Integrate with Google Distance Matrix API
    // For now, return mock data based on straight-line distance
    
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(destination.latitude - origin.latitude);
    const dLon = this.toRad(destination.longitude - origin.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(origin.latitude)) *
        Math.cos(this.toRad(destination.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    // Assume average speed of 30 km/h in city traffic
    const duration = (distance / 30) * 60; // Duration in minutes
    
    return {
      duration: Math.round(duration),
      distance: Math.round(distance * 100) / 100,
    };
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if any navigation app is available
   */
  static async isNavigationAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const googleMapsAvailable = await Linking.canOpenURL('comgooglemaps://');
        const appleMapsAvailable = await Linking.canOpenURL('maps://');
        return googleMapsAvailable || appleMapsAvailable;
      } else {
        const googleMapsAvailable = await Linking.canOpenURL('google.navigation:q=0,0');
        return googleMapsAvailable;
      }
    } catch (error) {
      console.error('Error checking navigation availability:', error);
      return false;
    }
  }
}
