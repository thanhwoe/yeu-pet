import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const [address, setAddress] = useState<Location.LocationGeocodedAddress>();
  const [loading, setLoading] = useState(false);
  const appState = useRef(AppState.currentState);
  // Request location permissions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  };

  // useEffect(() => {
  //   const subscription = AppState.addEventListener("change", (nextAppState) => {
  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === "active"
  //     ) {
  //       if (!address) {
  //         getCurrentCity();
  //       }
  //     }
  //     appState.current = nextAppState;
  //   });

  //   return () => {
  //     subscription?.remove();
  //   };
  // }, []);

  const getCurrentCity = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      // Reverse geocode to get address information
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addressInfo = reverseGeocode[0];

        setAddress(addressInfo);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      //   Alert.alert("Error", "Failed to get your location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentCity();
  }, []);

  return { address, loading, location };
};
