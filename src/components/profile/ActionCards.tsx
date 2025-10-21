import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface ActionCardsProps {
  colors: any;
  onFilesPress: () => void;
  onNotificationPress: () => void;
}

const ActionCards: React.FC<ActionCardsProps> = ({ colors, onFilesPress, onNotificationPress }) => {
  return (
    <View style={styles.cardsContainer}>
      {/* Files Card */}
      <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={onFilesPress}>
        <View style={styles.cardContent}>
          <Image 
            source={require('../../../assets/ui/file.png')} 
            style={styles.cardIcon}
            resizeMode="contain"
          />
          <Text style={[styles.cardText, { color: colors.text }]}>Files</Text>
        </View>
      </TouchableOpacity>

      {/* Notification Card */}
      <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={onNotificationPress}>
        <View style={styles.cardContent}>
          <Image 
            source={require('../../../assets/ui/notification.png')} 
            style={styles.cardIcon}
            resizeMode="contain"
          />
          <Text style={[styles.cardText, { color: colors.text }]}>Notification</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
    gap: tokens.spacing[4],
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 120,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    width: 60,
    height: 60,
    marginBottom: tokens.spacing[3],
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default ActionCards;
