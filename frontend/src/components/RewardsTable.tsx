import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { Reward } from '../constants/types';

interface RewardsTableProps {
  rewards: Reward[];
}

function getPositionIcon(position: number): string {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '🏅';
  }
}

export default function RewardsTable({ rewards }: RewardsTableProps) {
  if (rewards.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rewards</Text>
      <View style={styles.card}>
        {rewards.map((reward, index) => (
          <View
            key={reward.position}
            style={[styles.row, index < rewards.length - 1 && styles.rowDivider]}
          >
            <Text style={styles.icon}>{getPositionIcon(reward.position)}</Text>
            <Text style={styles.label}>{reward.label}</Text>
            <Text style={styles.amount}>₹{reward.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    fontSize: 18,
    width: 28,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
