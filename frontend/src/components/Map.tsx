'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '@/lib/googleMaps';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    onClick?: () => void;
  }>;
  height?: string;
  width?: string;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerDrag?: (lat: number, lng: number) => void;
  draggableMarker?: boolean;
}

const Map: React.FC<MapProps> = ({
  center = { lat: 13.7563, lng: 100.5018 }, // Default to Bangkok
  zoom = 14,
  markers = [],
  height = '400px',
  width = '100%',
  onMapClick,
  onMarkerDrag,
  draggableMarker = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [googleMarkers, setGoogleMarkers] = useState<google.maps.Marker[]>([]);
  const [draggablePosition, setDraggablePosition] = useState<{ lat: number; lng: number } | null>(
    draggableMarker ? center : null
  );
  const mapInitialized = useRef(false);

  // Load Google Maps and initialize the map
  useEffect(() => {
    if (mapInitialized.current) return;
    
    const initializeMap = () => {
      if (mapRef.current && !map) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          zoomControl: true,
          fullscreenControl: true,
        });
        
        setMap(newMap);
        mapInitialized.current = true;

        // Add click event listener if onMapClick is provided
        if (onMapClick) {
          newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
            const lat = event.latLng?.lat();
            const lng = event.latLng?.lng();
            if (lat !== undefined && lng !== undefined) {
              onMapClick(lat, lng);
              if (draggableMarker) {
                setDraggablePosition({ lat, lng });
              }
            }
          });
        }
      }
    };

    loadGoogleMapsScript(initializeMap);
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  // Create/update draggable marker
  useEffect(() => {
    if (map && draggableMarker && draggablePosition) {
      // Remove any existing draggable marker
      googleMarkers.forEach(marker => {
        if (marker.getDraggable()) {
          marker.setMap(null);
        }
      });

      // Create new draggable marker
      const marker = new window.google.maps.Marker({
        position: draggablePosition,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      // Add drag end event listener
      if (onMarkerDrag) {
        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            onMarkerDrag(lat, lng);
            setDraggablePosition({ lat, lng });
          }
        });
      }

      setGoogleMarkers(prev => [...prev.filter(m => !m.getDraggable()), marker]);
    }
  }, [map, draggableMarker, draggablePosition, onMarkerDrag]);

  // Create/update regular markers
  useEffect(() => {
    if (map && markers.length > 0) {
      // Clear existing non-draggable markers
      googleMarkers
        .filter(marker => !marker.getDraggable())
        .forEach(marker => marker.setMap(null));

      // Create new markers
      const newMarkers = markers.map(markerData => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
        });

        // Add click event listener
        if (markerData.onClick) {
          marker.addListener('click', markerData.onClick);
        }

        return marker;
      });

      // Update markers state - keep draggable markers
      setGoogleMarkers(prev => [...prev.filter(m => m.getDraggable()), ...newMarkers]);
    }

    // Cleanup function
    return () => {
      if (googleMarkers.length > 0) {
        googleMarkers.forEach(marker => marker.setMap(null));
      }
    };
  }, [map, markers]);

  return <div ref={mapRef} style={{ height, width }} />;
};

export default Map; 