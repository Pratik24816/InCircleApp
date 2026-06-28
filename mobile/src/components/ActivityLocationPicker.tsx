import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { AppInput } from './AppInput';
import { GOOGLE_PLACES_API_KEY, isPlacesConfigured } from '../config/places.config';
import { colors, radii, spacing, typography } from '../theme/tokens';

export type LocationSelection = {
  locationName: string;
  city: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  locationName: string;
  city: string;
  latitude?: number;
  longitude?: number;
  onChange: (value: LocationSelection) => void;
  locationError?: string;
  cityError?: string;
  biasCity?: string;
};

type GeocodeResult = {
  results?: {
    formatted_address?: string;
    address_components?: { long_name: string; types: string[] }[];
    geometry?: { location?: { lat: number; lng: number } };
  }[];
};

function extractCity(components: { long_name: string; types: string[] }[] = []): string {
  const locality = components.find(c => c.types.includes('locality'));
  if (locality) {
    return locality.long_name;
  }
  const admin = components.find(c => c.types.includes('administrative_area_level_2'));
  return admin?.long_name ?? '';
}

function extractPlaceName(
  description: string,
  components: { long_name: string; types: string[] }[] = [],
): string {
  const establishment = components.find(c => c.types.includes('establishment') || c.types.includes('point_of_interest'));
  if (establishment) {
    return establishment.long_name;
  }
  const route = components.find(c => c.types.includes('route'));
  if (route) {
    return route.long_name;
  }
  return description.split(',')[0]?.trim() ?? description;
}

async function reverseGeocode(lat: number, lng: number): Promise<LocationSelection | null> {
  if (!isPlacesConfigured()) {
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}&language=en`;
  const response = await fetch(url);
  const json = (await response.json()) as GeocodeResult;
  const first = json.results?.[0];
  if (!first) {
    return null;
  }

  const components = first.address_components ?? [];
  return {
    locationName: extractPlaceName(first.formatted_address ?? 'Current location', components),
    city: extractCity(components),
    latitude: lat,
    longitude: lng,
  };
}

export function ActivityLocationPicker({
  locationName,
  city,
  latitude,
  longitude,
  onChange,
  locationError,
  cityError,
  biasCity,
}: Props) {
  const [locating, setLocating] = useState(false);
  const placesReady = isPlacesConfigured();

  const useCurrentLocation = useCallback(() => {
    if (!placesReady) {
      Alert.alert(
        'Places API not configured',
        'Add GOOGLE_PLACES_API_KEY in places.config.local.ts to use location search.',
      );
      return;
    }

    setLocating(true);
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const selection = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          if (selection) {
            onChange(selection);
          } else {
            onChange({
              locationName: 'Current location',
              city: biasCity ?? city,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        } catch {
          Alert.alert('Could not resolve address', 'Try searching for a place instead.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        Alert.alert('Location unavailable', 'Enable location permission or search manually.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, [biasCity, city, onChange, placesReady]);

  const hasPin = latitude != null && longitude != null && latitude !== 0 && longitude !== 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Where</Text>
      <Text style={styles.hint}>Search a venue or landmark — we will pin it on the map for nearby discovery.</Text>

      {placesReady ? (
        <View style={styles.autocompleteShell}>
          <GooglePlacesAutocomplete
            placeholder="Search places in India…"
            fetchDetails
            enablePoweredByContainer={false}
            debounce={280}
            minLength={2}
            onPress={(_data, details = null) => {
              if (!details) {
                return;
              }
              const components = details.address_components ?? [];
              onChange({
                locationName: extractPlaceName(details.formatted_address ?? _data.description, components),
                city: extractCity(components) || biasCity || city,
                latitude: details.geometry?.location?.lat,
                longitude: details.geometry?.location?.lng,
              });
            }}
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: 'en',
              components: 'country:in',
            }}
            textInputProps={{
              placeholderTextColor: colors.muted,
              defaultValue: locationName,
            }}
            styles={{
              container: styles.autocompleteContainer,
              textInput: [styles.searchInput, locationError && styles.searchInputError],
              listView: styles.listView,
              row: styles.row,
              separator: styles.separator,
              description: styles.description,
              poweredContainer: styles.hidden,
            }}
          />
        </View>
      ) : (
        <View style={styles.fallbackNote}>
          <Text style={styles.fallbackText}>
            Add your Google Places API key in places.config.local.ts for search. You can still type a location below.
          </Text>
        </View>
      )}

      <AppInput
        label="Meeting spot"
        placeholder="Sabarmati Riverfront Gate 3"
        value={locationName}
        onChangeText={text => onChange({ locationName: text, city, latitude, longitude })}
        error={locationError}
      />
      <AppInput
        label="City"
        placeholder="Ahmedabad"
        value={city}
        onChangeText={text => onChange({ locationName, city: text, latitude, longitude })}
        error={cityError}
      />

      <Pressable
        onPress={useCurrentLocation}
        disabled={locating}
        style={({ pressed }) => [styles.gpsBtn, pressed && styles.gpsBtnPressed]}>
        {locating ? (
          <ActivityIndicator color={colors.secondary} size="small" />
        ) : (
          <Text style={styles.gpsBtnText}>📍 Use my current location</Text>
        )}
      </Pressable>

      {hasPin ? (
        <Text style={styles.pinHint}>
          Pin set · {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hint: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  autocompleteShell: {
    zIndex: 20,
    marginBottom: spacing.sm,
  },
  autocompleteContainer: {
    flex: 0,
  },
  searchInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 48,
    marginTop: 0,
  },
  searchInputError: {
    borderColor: colors.danger,
  },
  listView: {
    backgroundColor: '#0f172a',
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: spacing.xs,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  row: {
    backgroundColor: '#0f172a',
    paddingVertical: spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  description: {
    ...typography.body,
    color: colors.text,
  },
  hidden: { display: 'none' },
  fallbackNote: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  fallbackText: {
    ...typography.caption,
    color: colors.muted,
    lineHeight: 18,
  },
  gpsBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(77,181,255,0.45)',
    backgroundColor: 'rgba(77,181,255,0.08)',
    minHeight: 40,
    justifyContent: 'center',
  },
  gpsBtnPressed: { opacity: 0.85 },
  gpsBtnText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
  },
  pinHint: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
