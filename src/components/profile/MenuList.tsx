import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface MenuListProps {
  colors: any;
  onMenuPress: (menuItem: string) => void;
  onLogout: () => void;
}

const MenuList: React.FC<MenuListProps> = ({ colors, onMenuPress, onLogout }) => {
  const menuItems = [
    'Help & Support',
    'Payment Management',
    'General Info',
    'Appearance',
  ];

  return (
    <View style={styles.menuSection}>
      <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item}>
            <TouchableOpacity style={styles.menuItem} onPress={() => onMenuPress(item)}>
              <Text style={[styles.menuText, { color: colors.text }]}>{item}</Text>
              <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
            </TouchableOpacity>
            
            {index < menuItems.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}
        
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        
        {/* Logout */}
        <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
          <Text style={[styles.menuText, styles.logoutText, { color: colors.error }]}>Logout</Text>
          <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuSection: {
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[6],
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing[2],
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
  menuText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#083400',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#FF5A5A',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E2E2',
    marginHorizontal: tokens.spacing[2],
    marginVertical: tokens.spacing[1],
  },
});

export default MenuList;
