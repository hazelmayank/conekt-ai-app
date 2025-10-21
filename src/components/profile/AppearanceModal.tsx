import React from 'react';
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { tokens } from '@/theme/tokens';

const { width, height } = Dimensions.get('window');

interface AppearanceModalProps {
  visible: boolean;
  colors: any;
  theme: 'device' | 'light' | 'dark';
  slideAnim: Animated.Value;
  onThemeChange: (theme: 'device' | 'light' | 'dark') => void;
  onClose: () => void;
}

const AppearanceModal: React.FC<AppearanceModalProps> = ({
  visible,
  colors,
  theme,
  slideAnim,
  onThemeChange,
  onClose,
}) => {
  if (!visible) return null;

  const themeOptions = [
    { value: 'device' as const, label: 'Same as device' },
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
  ];

  return (
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => {}} // Prevent closing when tapping the modal itself
      >
        <Animated.View style={[
          styles.appearanceModal,
          { backgroundColor: colors.surface, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Appearance</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Image 
                source={require('../../../assets/ui/cross_icon.png')} 
                style={styles.closeButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.themeOptions}>
            {themeOptions.map((option) => (
              <TouchableOpacity 
                key={option.value}
                style={styles.themeOption}
                onPress={() => onThemeChange(option.value)}
              >
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radioCircle,
                    { borderColor: colors.border },
                    theme === option.value && styles.radioCircleSelected
                  ]}>
                    {theme === option.value && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.themeOptionText, { color: colors.text }]}>{option.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(68, 68, 68, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  appearanceModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: width,
    maxHeight: height * 0.4,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderTopWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#083400',
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonIcon: {
    width: 20,
    height: 20,
  },
  themeOptions: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
  },
  themeOption: {
    paddingVertical: tokens.spacing[3],
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#083400',
    marginRight: tokens.spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#083400',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#083400',
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#083400',
    fontFamily: 'Poppins_500Medium',
  },
});

export default AppearanceModal;
