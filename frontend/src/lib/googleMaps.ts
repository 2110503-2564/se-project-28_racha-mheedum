// Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Calculate distance between two coordinates in kilometers using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

// Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Get current user location
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
};

// Get formatted address from coordinates (reverse geocoding)
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return '';
  } catch (error) {
    console.error('Error fetching address:', error);
    return '';
  }
};

// Interface for the Google Maps script loader
declare global {
  interface Window {
    initMap: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any; // Using any is acceptable here as Google Maps API is external
    googleMapsCallbacks: Array<() => void>;
    googleMapsLoaded: boolean;
    googleMapsLoading: boolean;
  }
}

// Load Google Maps script dynamically
export const loadGoogleMapsScript = (callback: () => void): void => {
  if (typeof window === 'undefined') return;

  // Initialize callback queue if not exists
  if (!window.googleMapsCallbacks) {
    window.googleMapsCallbacks = [];
  }

  // If Google Maps is already loaded, call the callback directly
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  // Add this callback to the queue
  window.googleMapsCallbacks.push(callback);

  // If script is already loading, don't add it again
  if (window.googleMapsLoading) return;

  // Define the callback that will be called once Google Maps is loaded
  window.initMap = () => {
    window.googleMapsLoaded = true;
    window.googleMapsLoading = false;
    
    // Execute all callbacks in the queue
    if (window.googleMapsCallbacks && window.googleMapsCallbacks.length > 0) {
      window.googleMapsCallbacks.forEach(cb => cb());
      window.googleMapsCallbacks = [];
    }
  };

  // Only add the script if it's not already in the DOM
  if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
    window.googleMapsLoading = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
};

export default {
  GOOGLE_MAPS_API_KEY,
  calculateDistance,
  getCurrentLocation,
  getAddressFromCoordinates,
  loadGoogleMapsScript,
}; 