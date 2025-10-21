import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface CampaignsHeaderProps {
  onBack: () => void;
  colors: any;
}

const CampaignsHeader: React.FC<CampaignsHeaderProps> = ({ onBack, colors }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Image 
          source={require('../../../assets/ui/back_icon.png')} 
          style={styles.backIcon} 
          resizeMode="contain" 
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>Campaigns</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: 18,
    height: 18,
  },
  title: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
});

export default CampaignsHeader;
