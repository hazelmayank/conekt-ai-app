import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface CampaignItemProps {
  campaign: any;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  reordering: boolean;
  onDelete: (campaignId: string, campaignName: string) => void;
  onMoveUp: (campaignId: string) => void;
  onMoveDown: (campaignId: string) => void;
  colors: any;
}

const CampaignItem: React.FC<CampaignItemProps> = ({ 
  campaign, 
  index, 
  isFirst, 
  isLast, 
  reordering,
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  colors 
}) => {
  return (
    <View style={[styles.campaignCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.campaignContent}>
        <Image 
          source={require('../../../assets/icons/image.png')} 
          style={styles.campaignLogo} 
          resizeMode="contain" 
        />
        <View style={styles.campaignInfo}>
          <Text style={[styles.campaignName, { color: colors.text }]}>
            {campaign.campaign_name || campaign.campaign}
          </Text>
          <Text style={[styles.companyName, { color: colors.text }]}>
            {campaign.company_name || campaign.company}
          </Text>
          {campaign.status && (
            <Text style={[styles.campaignStatus, { color: colors.textSecondary }]}>
              Status: {campaign.status}
            </Text>
          )}
          <Text style={[styles.playOrderText, { color: colors.textSecondary }]}>
            Order: {campaign.play_order || index + 1}
          </Text>
        </View>
        <View style={styles.campaignActions}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete(campaign._id || campaign.id, campaign.campaign_name || campaign.campaign)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Reorder Controls */}
      <View style={[styles.reorderControls, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
          onPress={() => onMoveUp(campaign._id || campaign.id)}
          disabled={isFirst || reordering}
        >
          <Text style={styles.reorderButtonText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
          onPress={() => onMoveDown(campaign._id || campaign.id)}
          disabled={isLast || reordering}
        >
          <Text style={styles.reorderButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    borderWidth: 1,
    borderColor: tokens.colors.stroke.soft,
  },
  campaignContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  campaignLogo: {
    width: 40,
    height: 40,
    marginRight: tokens.spacing[3],
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[1],
  },
  companyName: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    marginBottom: tokens.spacing[1],
  },
  campaignStatus: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    marginBottom: tokens.spacing[1],
  },
  playOrderText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
  },
  campaignActions: {
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.accent.offline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.surface.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  reorderControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: tokens.colors.stroke.soft,
  },
  reorderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: tokens.spacing[2],
  },
  reorderButtonDisabled: {
    backgroundColor: tokens.colors.stroke.soft,
  },
  reorderButtonText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.surface.white,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CampaignItem;
