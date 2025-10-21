import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Polyline, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import type { LatLng, Region } from 'react-native-maps';
import { tokens } from '@/theme/tokens';
import { Truck, City } from '@/types/api';

interface MapViewSectionProps {
  trucks: Truck[];
  selectedCity: City | null;
  mapRef: React.RefObject<MapView | null>;
}

// Helper functions
const toLatLngObjects = (pairs?: any): LatLng[] => {
  if (!Array.isArray(pairs)) return [];
  return pairs
    .map((p: any) => {
      if (Array.isArray(p) && p.length === 2) {
        const [lat, lng] = p;
        if (typeof lat === 'number' && typeof lng === 'number') {
          return { latitude: lat, longitude: lng } as LatLng;
        }
      } else if (p && typeof p === 'object' && typeof p.lat === 'number' && typeof p.lng === 'number') {
        return { latitude: p.lat, longitude: p.lng } as LatLng;
      }
      return null;
    })
    .filter(Boolean) as LatLng[];
};

const expandTwoPointRect = (coords: LatLng[]): LatLng[] => {
  if (coords.length !== 2) return coords;
  const sw = coords[0];
  const ne = coords[1];
  const nw = { latitude: ne.latitude, longitude: sw.longitude };
  const se = { latitude: sw.latitude, longitude: ne.longitude };
  return [sw, se, ne, nw, sw];
};

const fitAll = (mapRef: React.RefObject<MapView | null>, coords: LatLng[]) => {
  if (!mapRef.current || !coords.length) return;
  mapRef.current.fitToCoordinates(coords, {
    edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
    animated: true,
  });
};

const regionFromCity = (city?: City | null): Region => {
  const lat = city?.coordinates?.lat ?? 19.0760;
  const lng = city?.coordinates?.lng ?? 72.8777;
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };
};

const MapViewSection: React.FC<MapViewSectionProps> = ({ trucks, selectedCity, mapRef }) => {
  const initialRegion = useMemo(() => regionFromCity(selectedCity), [selectedCity]);

  // Memoize map markers to prevent unnecessary re-renders
  const mapMarkers = useMemo(() => {
    return trucks.map((t) => {
      const poly = toLatLngObjects((t.route as any)?.polyline);
      let area = toLatLngObjects((t.route as any)?.polygon);
      if (area.length === 2) area = expandTwoPointRect(area);
      const hasGps = typeof t.gps_lat === 'number' && typeof t.gps_lng === 'number';

      return (
        <React.Fragment key={t._id}>
          {/* soft glow under route */}
          {!!poly.length && (
            <Polyline coordinates={poly} strokeColor="rgba(39,174,96,0.25)" strokeWidth={10} />
          )}
          {!!poly.length && <Polyline coordinates={poly} strokeColor="#27AE60" strokeWidth={6} />}

          {!!area.length && (
            <Polygon
              coordinates={area}
              strokeColor="#27AE60"
              fillColor="rgba(135,234,92,0.18)"
              strokeWidth={2}
            />
          )}

          {hasGps && (
            <Marker coordinate={{ latitude: t.gps_lat!, longitude: t.gps_lng! }}>
              <View style={markerStyles.wrap}>
                <View style={markerStyles.halo} />
                <Image
                  source={require('../../../assets/icons/location_pin_filled.png')}
                  style={markerStyles.img}
                  resizeMode="contain"
                />
              </View>
            </Marker>
          )}
        </React.Fragment>
      );
    });
  }, [trucks]);

  // Auto-fit to all trucks + routes when trucks or city changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!trucks.length) {
      mapRef.current.animateToRegion(initialRegion, 400);
      return;
    }

    const all: LatLng[] = [];
    trucks.forEach((t) => {
      if (typeof t.gps_lat === 'number' && typeof t.gps_lng === 'number') {
        all.push({ latitude: t.gps_lat, longitude: t.gps_lng });
      }
      const poly = toLatLngObjects((t.route as any)?.polyline);
      if (poly.length) all.push(...poly);
      let area = toLatLngObjects((t.route as any)?.polygon);
      if (area.length === 2) area = expandTwoPointRect(area);
      if (area.length) all.push(...area);
    });

    if (all.length) fitAll(mapRef, all);
  }, [trucks, initialRegion]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsCompass
        showsBuildings
        toolbarEnabled={false}
        loadingEnabled
      >
        {mapMarkers}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const markerStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(135,234,92,0.25)',
  },
  img: { width: 28, height: 28 },
});

export default MapViewSection;
