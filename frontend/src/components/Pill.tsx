import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

export type PillVariant = 'neutral' | 'success' | 'accent';

interface PillProps {
  label: string;
  variant?: PillVariant;
}

function getVariantStyles(variant: PillVariant) {
  switch (variant) {
    case 'success':
      return { container: styles.successContainer, text: styles.successText };
    case 'accent':
      return { container: styles.accentContainer, text: styles.accentText };
    default:
      return { container: styles.neutralContainer, text: styles.neutralText };
  }
}

export default function Pill({ label, variant = 'neutral' }: PillProps) {
  const variantStyles = getVariantStyles(variant);
  return (
    <View style={[styles.container, variantStyles.container]}>
      <Text style={[styles.text, variantStyles.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  neutralContainer: {
    backgroundColor: colors.border,
  },
  neutralText: {
    color: colors.textSecondary,
  },
  successContainer: {
    backgroundColor: colors.successLight,
  },
  successText: {
    color: colors.success,
  },
  accentContainer: {
    backgroundColor: colors.primaryLight,
  },
  accentText: {
    color: colors.primaryDark,
  },
});
