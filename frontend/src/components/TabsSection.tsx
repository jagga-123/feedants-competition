import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

// Roughly the character count that fills 3 lines of body text at this card's
// width. react-native-web doesn't reliably fire onTextLayout, so line-count
// detection isn't portable across platforms — this heuristic is used instead.
const TRUNCATE_CHAR_THRESHOLD = 180;

interface TabsSectionProps {
  aboutText?: string;
  judgingParamsText?: string;
  rulesText?: string;
}

type TabKey = 'about' | 'judging' | 'rules';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

export default function TabsSection({ aboutText, judgingParamsText, rulesText }: TabsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('about');

  const textByTab: Record<TabKey, string | undefined> = {
    about: aboutText,
    judging: judgingParamsText,
    rules: rulesText,
  };

  return (
    <View style={styles.section}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.card}>
        <ExpandableText key={activeTab} text={textByTab[activeTab]} />
      </View>
    </View>
  );
}

function ExpandableText({ text }: { text?: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) {
    return <Text style={styles.emptyText}>No details provided.</Text>;
  }

  const isTruncatable = text.length > TRUNCATE_CHAR_THRESHOLD;

  return (
    <View>
      <Text style={styles.bodyText} numberOfLines={expanded ? undefined : 3}>
        {text}
      </Text>
      {isTruncatable && (
        <TouchableOpacity onPress={() => setExpanded((prev) => !prev)} activeOpacity={0.7}>
          <Text style={styles.viewMore}>{expanded ? 'View less' : 'View more'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radii.md,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.card,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  viewMore: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
