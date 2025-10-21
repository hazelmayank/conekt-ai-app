import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';
import { citiesService, trucksService } from '@/services/services';
import { City } from '@/types/api';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';

interface AddTruckScreenProps {
  navigation?: any;
}

const AddTruckScreen: React.FC<AddTruckScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [route, setRoute] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const citiesData = await citiesService.getAllCities();
        setCities(citiesData);
      } catch (error) {
        showAlert({
          message: `Failed to load cities: ${error instanceof Error ? error.message : 'Please try again.'}`,
          type: 'error',
          title: 'Error'
        });
      }
    })();
  }, [showAlert]);

  const handleSave = async () => {
    if (!selectedCityId || !registrationNumber || !route) {
      showAlert({
        message: 'Please fill in all required fields',
        type: 'error',
        title: 'Error'
      });
      return;
    }
    setLoading(true);
    try {
      const truckData = {
        city_id: selectedCityId,
        truck_number: registrationNumber,
        route: {
          route_name: route,
          polyline: [
            { lat: 19.0760, lng: 72.8777 },
            { lat: 19.0761, lng: 72.8778 },
            { lat: 19.0762, lng: 72.8779 },
          ],
          polygon: [
            { lat: 19.0750, lng: 72.8760 },
            { lat: 19.0770, lng: 72.8790 },
          ],
        },
        gps_lat: 19.0760,
        gps_lng: 72.8777,
      };
      await trucksService.createTruck(truckData);
      showAlert({
        message: 'Truck created successfully!',
        type: 'success',
        title: 'Success'
      });
      navigation?.goBack();
    } catch (error) {
      showAlert({
        message: `Failed to create truck: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCityId(city._id);
    setSelectedCityName(city.name);
    setDropdownVisible(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
            <Image source={require('../../assets/ui/back_icon.png')} style={styles.backIcon} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Truck</Text>
        </View>

        {/* Form Fields - Matching Figma Layout */}
        <View style={styles.formContainer}>
          {/* Registration Number Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Registration Number</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>
            <View style={[styles.inputField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputText, { color: colors.text }]}
                placeholder="Enter registration number (e.g., KA 01 A 1234)"
                placeholderTextColor={colors.textSecondary}
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
              />
            </View>
          </View>

          {/* City Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dropdownContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={[
                styles.dropdownText,
                selectedCityName ? [styles.dropdownTextSelected, { color: colors.text }] : [styles.dropdownTextPlaceholder, { color: colors.textSecondary }]
              ]}>
                {selectedCityName || 'Select'}
              </Text>
              <Text style={[styles.dropdownArrow, { color: colors.text }]}>
                {dropdownVisible ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            
            {/* Dropdown Menu */}
            {dropdownVisible && (
              <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city._id}
                    style={[
                      styles.dropdownItem,
                      selectedCityId === city._id && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleCitySelect(city)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      { color: colors.text },
                      selectedCityId === city._id && styles.dropdownItemTextSelected
                    ]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Route Field */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Route</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>
            <View style={[styles.inputField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.inputText, { color: colors.text }]}
                placeholder="eg. Hebbal Route"
                placeholderTextColor={colors.textSecondary}
                value={route}
                onChangeText={setRoute}
              />
            </View>
          </View>
        </View>

        <View style={[styles.saveButtonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.surface, borderColor: colors.primary }, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={[styles.saveButtonText, { color: colors.text }]}>Save</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FB' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  backIcon: { 
    width: 24, 
    height: 24 
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
    flex: 1,
    marginRight: 32, // To center the title
  },
  // Form container - matching Figma layout
  formContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[6],
  },
  fieldGroup: { 
    marginBottom: tokens.spacing[8] 
  },
  labelContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: tokens.spacing[2] 
  },
  label: { 
    fontSize: 16, 
    fontFamily: 'Poppins_400Regular', 
    color: '#083400' 
  },
  requiredAsterisk: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: tokens.spacing[1],
    fontFamily: 'Poppins_400Regular',
  },
  // Dropdown styles
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[3],
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  dropdownTextPlaceholder: {
    color: '#DFDFDF',
  },
  dropdownTextSelected: {
    color: '#083400',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    marginTop: tokens.spacing[1],
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E2',
    minHeight: 48,
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontFamily: 'Poppins_600SemiBold',
  },
  // Input field styles
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 54,
    paddingHorizontal: tokens.spacing[3],
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
  },
  // Save button styles
  saveButtonContainer: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  saveButton: {
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#87EA5C',
  },
  saveButtonDisabled: {
    backgroundColor: '#E2E2E2',
    borderColor: '#E2E2E2',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
});

export default AddTruckScreen;