import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { CtaState } from '../constants/types';

interface BottomCTAButtonProps {
  ctaState: CtaState;
  loading: boolean;
  onRegister: () => void;
  onSubmit: () => void;
  onViewResults: () => void;
}

type Variant = 'primary' | 'disabled' | 'success';

interface CtaConfig {
  label: string;
  disabled: boolean;
  onPress?: () => void;
  variant: Variant;
}

function getCtaConfig(
  ctaState: CtaState,
  handlers: Pick<BottomCTAButtonProps, 'onRegister' | 'onSubmit' | 'onViewResults'>
): CtaConfig {
  switch (ctaState) {
    case 'can_register':
      return { label: 'Register Now', disabled: false, onPress: handlers.onRegister, variant: 'primary' };
    case 'already_registered':
      return { label: "You're Registered", disabled: true, variant: 'success' };
    case 'registration_closed':
      return { label: 'Registration Closed', disabled: true, variant: 'disabled' };
    case 'can_submit':
      return { label: 'Upload Submission', disabled: false, onPress: handlers.onSubmit, variant: 'primary' };
    case 'already_submitted':
      return { label: 'Registered — Submitted', disabled: true, variant: 'success' };
    case 'awaiting_results':
      return { label: 'Awaiting Results', disabled: true, variant: 'disabled' };
    case 'view_results':
      return { label: 'View Results', disabled: false, onPress: handlers.onViewResults, variant: 'primary' };
    default:
      return { label: 'Unavailable', disabled: true, variant: 'disabled' };
  }
}

export default function BottomCTAButton({ ctaState, loading, onRegister, onSubmit, onViewResults }: BottomCTAButtonProps) {
  const config = getCtaConfig(ctaState, { onRegister, onSubmit, onViewResults });
  const isDisabled = config.disabled || loading;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles[config.variant], isDisabled && styles.buttonDisabled]}
        disabled={isDisabled}
        onPress={config.onPress}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{config.label}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    height: 50,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  success: {
    backgroundColor: colors.success,
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
