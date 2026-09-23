import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { Winner } from '../constants/types';

interface WinnersListProps {
  winners: Winner[];
}

function getWinnerName(winner: Winner): string {
  return winner.guestName || winner.userId?.name || 'Participant';
}

function getPositionBadge(position: number): string {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `#${position}`;
}

export default function WinnersList({ winners }: WinnersListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Previous Winners</Text>
      {winners.length === 0 ? (
        <Text style={styles.emptyText}>No winners to show yet.</Text>
      ) : (
        <FlatList
          horizontal
          data={winners}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const name = getWinnerName(item);
            return (
              <View style={styles.card}>
                {item.guestPhoto ? (
                  <Image source={{ uri: item.guestPhoto }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <Text style={styles.positionBadge}>{getPositionBadge(item.position)}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: 96,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  positionBadge: {
    fontSize: 16,
    marginTop: spacing.xs,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
});
