import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/theme/tokens';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const { width, height } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
  type = 'info'
}) => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          iconColor: '#10B981',
          backgroundColor: '#ECFDF5',
          borderColor: '#10B981',
          iconBackground: '#D1FAE5',
        };
      case 'error':
        return {
          icon: '✕',
          iconColor: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          iconBackground: '#FEE2E2',
        };
      case 'warning':
        return {
          icon: '⚠',
          iconColor: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          iconBackground: '#FEF3C7',
        };
      default:
        return {
          icon: 'ℹ',
          iconColor: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#3B82F6',
          iconBackground: '#DBEAFE',
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View 
          style={[
            styles.backdrop,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            { opacity: fadeAnim }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim }
                  ]
                }
              ]}
            >
              {/* Icon */}
              <View style={[
                styles.iconContainer,
                { backgroundColor: typeConfig.iconBackground }
              ]}>
                <Text style={[
                  styles.icon,
                  { color: typeConfig.iconColor }
                ]}>
                  {typeConfig.icon}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {title && (
                  <Text style={[
                    styles.title,
                    { color: colors.text }
                  ]}>
                    {title}
                  </Text>
                )}
                <Text style={[
                  styles.message,
                  { color: colors.textSecondary }
                ]}>
                  {message}
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      {
                        backgroundColor: button.style === 'destructive' 
                          ? '#EF4444' 
                          : button.style === 'cancel'
                          ? colors.surface
                          : colors.primary,
                        borderColor: button.style === 'cancel' 
                          ? colors.border 
                          : 'transparent',
                        borderWidth: button.style === 'cancel' ? 1 : 0,
                        marginLeft: index > 0 ? 12 : 0,
                      }
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.buttonText,
                      {
                        color: button.style === 'cancel' 
                          ? colors.text 
                          : colors.surface,
                        fontWeight: button.style === 'destructive' 
                          ? '600' 
                          : '500'
                      }
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CustomAlert;


