import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
}

type Language = 'ENG' | 'HIN';

export default function ScreenHeader({ title }: ScreenHeaderProps) {
  // Visual only — does not translate any content.
  const [language, setLanguage] = useState<Language>('ENG');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.langToggle}>
        {(['ENG', 'HIN'] as Language[]).map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.langOption, language === lang && styles.langOptionActive]}
            onPress={() => setLanguage(lang)}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: spacing.sm,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    padding: 2,
  },
  langOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  langOptionActive: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.white,
  },
});
