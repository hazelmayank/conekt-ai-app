import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import { City } from '@/types/api';

interface CityDropdownMenuProps {
  cities: City[];
  selectedCity: City | null;
  onCitySelect: (city: City) => void;
}

const CityDropdownMenu: React.FC<CityDropdownMenuProps> = ({
  cities,
  selectedCity,
  onCitySelect,
}) => {
  return (
    <View style={styles.dropdownMenu}>
      {cities.map((city, idx) => {
        const isActive = city._id === selectedCity?._id;
        return (
          <TouchableOpacity
            key={city._id ?? String(idx)}
            style={[styles.dropdownItem, idx === cities.length - 1 ? { borderBottomWidth: 0 } : null]}
            onPress={() => onCitySelect(city)}
          >
            <View style={styles.radioCircle}>
              {isActive ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={[styles.dropdownItemText, isActive && styles.dropdownItemTextSelected]}>
              {city.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownMenu: {
    backgroundColor: '#87EA5CCC',
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'absolute',
    top: 90,
    left: tokens.spacing[4],
    right: tokens.spacing[4],
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(8,52,0,0.20)',
    minHeight: 48,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#083400',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#083400',
  },
  dropdownItemText: {
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
    paddingRight: 8,
  },
  dropdownItemTextSelected: {
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CityDropdownMenu;
