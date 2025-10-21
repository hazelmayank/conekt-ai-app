import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface MonthHeaderProps {
  colors: any;
}

const MonthHeader: React.FC<MonthHeaderProps> = ({ colors }) => {
  return (
    <View style={styles.monthHeader}>
      <Image 
        source={require('../../../assets/icons/calendar_month.png')} 
        style={[styles.calendarIcon, { tintColor: colors.text }]} 
        resizeMode="contain" 
      />
      <Text style={[styles.monthText, { color: colors.text }]}>
        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  monthText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
});

export default MonthHeader;
