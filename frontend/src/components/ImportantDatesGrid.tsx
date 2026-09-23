import React from 'react';
import { format } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

interface ImportantDatesGridProps {
  registrationDeadline: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
}

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), 'dd MMM yyyy, hh:mm a');
  } catch {
    return iso;
  }
}

export default function ImportantDatesGrid({
  registrationDeadline,
  submissionStart,
  submissionEnd,
  resultDate,
}: ImportantDatesGridProps) {
  const items = [
    { label: 'Registration Deadline', value: registrationDeadline },
    { label: 'Submission Starts', value: submissionStart },
    { label: 'Submission Ends', value: submissionEnd },
    { label: 'Result Date', value: resultDate },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Important Dates</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.cell}>
            <Text style={styles.cellLabel}>{item.label}</Text>
            <Text style={styles.cellValue}>{formatDate(item.value)}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cellLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
