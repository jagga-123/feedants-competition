import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownTimerProps {
  label: string;
  targetDate: string;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export default function CountdownTimer({ label, targetDate }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      {isExpired ? (
        <Text style={styles.expired}>Time's up</Text>
      ) : (
        <View style={styles.timerRow}>
          <TimeUnit value={pad(days)} unit="D" />
          <Text style={styles.colon}>:</Text>
          <TimeUnit value={pad(hours)} unit="H" />
          <Text style={styles.colon}>:</Text>
          <TimeUnit value={pad(minutes)} unit="M" />
          <Text style={styles.colon}>:</Text>
          <TimeUnit value={pad(seconds)} unit="S" />
        </View>
      )}
    </View>
  );
}

function TimeUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={styles.unitBlock}>
      <Text style={styles.unitValue}>{value}</Text>
      <Text style={styles.unitLabel}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitBlock: {
    alignItems: 'center',
    minWidth: 40,
  },
  unitValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  unitLabel: {
    fontSize: 10,
    color: colors.primaryLight,
  },
  colon: {
    fontSize: 20,
    color: colors.primaryLight,
    marginHorizontal: 2,
  },
  expired: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
