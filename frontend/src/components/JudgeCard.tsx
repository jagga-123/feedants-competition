import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { Judge } from '../constants/types';

interface JudgeCardProps {
  judge: Judge | null;
}

export default function JudgeCard({ judge }: JudgeCardProps) {
  if (!judge) {
    return null;
  }

  const handlePlayIntro = () => {
    Alert.alert('Judge Intro', 'Video playback not implemented in this demo.');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Judge</Text>
      <View style={styles.row}>
        {judge.photo ? (
          <Image source={{ uri: judge.photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={styles.photoFallbackText}>{judge.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{judge.name}</Text>
          {!!judge.experienceText && <Text style={styles.experience}>{judge.experienceText}</Text>}
        </View>
        {!!judge.introVideoUrl && (
          <TouchableOpacity style={styles.playButton} onPress={handlePlayIntro} activeOpacity={0.8}>
            <Text style={styles.playIcon}>▶</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!judge.bio && <Text style={styles.bio}>{judge.bio}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
  },
  photoFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFallbackText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  experience: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: colors.white,
    fontSize: 14,
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
