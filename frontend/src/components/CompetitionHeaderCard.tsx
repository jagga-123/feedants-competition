import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { UserState } from '../constants/types';
import Pill from './Pill';
import ProgressBar from './ProgressBar';

interface CompetitionHeaderCardProps {
  title: string;
  category: string[];
  userState: UserState;
  prizePool: number;
  entryFee: number;
  spotsBooked: number;
  maxSpots: number;
  spotsLeft: number;
}

export default function CompetitionHeaderCard({
  title,
  category,
  userState,
  prizePool,
  entryFee,
  spotsBooked,
  maxSpots,
  spotsLeft,
}: CompetitionHeaderCardProps) {
  const isRegistered = userState === 'registered' || userState === 'submitted';

  return (
    <View style={styles.card}>
      <View style={styles.tagsRow}>
        {category.map((tag) => (
          <Pill key={tag} label={tag} variant="neutral" />
        ))}
        <Pill label="🏆 Winners get certificate" variant="accent" />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Pill label={isRegistered ? 'Registered' : 'Not Registered'} variant={isRegistered ? 'success' : 'neutral'} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValue}>₹{prizePool}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.statValue}>₹{entryFee}</Text>
        </View>
      </View>

      <View style={styles.spotsSection}>
        <View style={styles.spotsLabelRow}>
          <Text style={styles.spotsText}>
            {spotsBooked}/{maxSpots} spots filled
          </Text>
          <Text style={styles.spotsLeftText}>{spotsLeft} left</Text>
        </View>
        <ProgressBar progress={maxSpots > 0 ? spotsBooked / maxSpots : 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  spotsSection: {
    gap: spacing.xs,
  },
  spotsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spotsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  spotsLeftText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
