import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface TruckDetailsHeaderProps {
  onBack: () => void;
  colors: any;
}

const TruckDetailsHeader: React.FC<TruckDetailsHeaderProps> = ({ onBack, colors }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Image 
          source={require('../../../assets/ui/back_icon.png')} 
          style={styles.backIcon} 
          resizeMode="contain" 
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>My Truck</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    width: 18,
    height: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
    flex: 1,
    marginRight: 32, // To center the title
  },
});

export default TruckDetailsHeader;
