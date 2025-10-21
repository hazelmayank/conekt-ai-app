import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CampaignCardProps {
  cycleNumber: 1 | 2;
  cyclePeriod: string;
  slotsFilled: number;
  maxSlots: number;
  isFull: boolean;
  onAddCampaigns: () => void;
  onPushPlaylist: () => void;
  colors: any;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  cycleNumber,
  cyclePeriod,
  slotsFilled,
  maxSlots,
  isFull,
  onAddCampaigns,
  onPushPlaylist,
  colors 
}) => {
  const progressPercentage = (slotsFilled / maxSlots) * 100;
  const progressColor = isFull ? '#A92C0C' : '#FFA200';
  const statusColor = isFull ? '#A92C0C' : '#FFA100';

  return (
    <View style={[styles.campaignCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.campaignHeader}>
        <Text style={[styles.cycleTitle, { color: colors.text }]}>Cycle {cycleNumber}</Text>
        <Text style={[styles.cyclePeriod, { color: colors.textSecondary }]}>{cyclePeriod}</Text>
      </View>
      <View style={styles.campaignDetails}>
        <Text style={[styles.slotsText, { color: colors.text }]}>
          {slotsFilled}/{maxSlots} slots filled
        </Text>
        <Text style={[styles.statusTextStyle, { color: statusColor }]}>
          {isFull ? 'Full' : 'Available'}
        </Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[
          styles.progressFill, 
          { 
            width: `${progressPercentage}%`, 
            backgroundColor: progressColor 
          }
        ]} />
      </View>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            { backgroundColor: colors.surface, borderColor: colors.primary },
            isFull && { borderColor: '#A92C0C' }
          ]} 
          onPress={onAddCampaigns}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            {isFull ? 'View Campaigns' : 'Add Campaigns'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.pushNowButton, { backgroundColor: colors.primary }]} 
          onPress={onPushPlaylist}
        >
          <Text style={[styles.pushNowButtonText, { color: colors.text }]}>Push Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  campaignHeader: {
    marginBottom: 12,
  },
  cycleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: 2,
  },
  cyclePeriod: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
  },
  campaignDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotsText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
  },
  statusTextStyle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E2E2',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#53C920',
    height: 44,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
  pushNowButton: {
    backgroundColor: '#87EA5C',
    borderRadius: 12,
    height: 44,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pushNowButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
});

export default CampaignCard;
