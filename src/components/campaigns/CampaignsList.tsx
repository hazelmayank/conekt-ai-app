import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import CampaignItem from './CampaignItem';

interface CampaignsListProps {
  campaigns: any[];
  reordering: boolean;
  onDeleteCampaign: (campaignId: string, campaignName: string) => void;
  onMoveCampaign: (campaignId: string, direction: 'up' | 'down') => void;
  colors: any;
}

const CampaignsList: React.FC<CampaignsListProps> = ({ 
  campaigns, 
  reordering, 
  onDeleteCampaign, 
  onMoveCampaign, 
  colors 
}) => {
  return (
    <ScrollView style={styles.campaignsContainer} showsVerticalScrollIndicator={false}>
      {campaigns.map((campaign, index) => (
        <CampaignItem
          key={campaign._id || campaign.id}
          campaign={campaign}
          index={index}
          isFirst={index === 0}
          isLast={index === campaigns.length - 1}
          reordering={reordering}
          onDelete={onDeleteCampaign}
          onMoveUp={(campaignId) => onMoveCampaign(campaignId, 'up')}
          onMoveDown={(campaignId) => onMoveCampaign(campaignId, 'down')}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  campaignsContainer: {
    flex: 1,
  },
});

export default CampaignsList;
