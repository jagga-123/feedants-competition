import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { getCompetitionDetails, normalizeApiError, registerForCompetition, submitForCompetition } from '../services/api';
import { CompetitionDetails } from '../constants/types';
import { colors, radii, spacing } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import CompetitionHeaderCard from '../components/CompetitionHeaderCard';
import JudgeCard from '../components/JudgeCard';
import CountdownTimer from '../components/CountdownTimer';
import ImportantDatesGrid from '../components/ImportantDatesGrid';
import WinnersList from '../components/WinnersList';
import TabsSection from '../components/TabsSection';
import RewardsTable from '../components/RewardsTable';
import BottomCTAButton from '../components/BottomCTAButton';

// Temporary hardcoded identifiers — real navigation/auth wiring comes later.
const COMPETITION_ID = '6ab39587b2ea219ab048238e';
const USER_ID = '6ab39587b2ea219ab048238f';

export default function CompetitionDetailsScreen() {
  const [data, setData] = useState<CompetitionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setError(null);
    try {
      const result = await getCompetitionDetails(COMPETITION_ID, USER_ID);
      setData(result);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleRetry = () => {
    setLoading(true);
    fetchDetails();
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await registerForCompetition(COMPETITION_ID, { userId: USER_ID });
      await fetchDetails();
    } catch (err) {
      Alert.alert('Registration failed', normalizeApiError(err).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    // The picker dialog runs before actionLoading is set, so it's the OS/browser
    // file dialog the user sees, not our own spinner — that only kicks in once
    // a file is actually picked and the upload/submit call is in flight.
    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      copyToCacheDirectory: true,
    });
    if (pickerResult.canceled) {
      return;
    }
    const asset = pickerResult.assets?.[0];
    if (!asset) {
      return;
    }

    setActionLoading(true);
    try {
      // No real file storage/CDN is configured for this assignment — the
      // picked file's local URI is used directly as fileUrl. See README.
      await submitForCompetition(COMPETITION_ID, { userId: USER_ID, fileUrl: asset.uri });
      await fetchDetails();
    } catch (err) {
      Alert.alert('Submission failed', normalizeApiError(err).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewResults = () => {
    Alert.alert('Winners', 'The full winners screen is coming in a later phase.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Something went wrong.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 'can_register' means "not registered yet and registration is still open".
  // During the overlap window liveStatus is 'submission_open', but that user
  // can't submit yet — what's about to close for them is registration.
  const countdownConfig =
    data.liveStatus === 'registration_open' || data.ctaState === 'can_register'
      ? { label: 'Registration closes in', targetDate: data.registrationDeadline }
      : data.liveStatus === 'submission_open'
      ? { label: 'Submission closes in', targetDate: data.submissionEnd }
      : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={data.title} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CompetitionHeaderCard
          title={data.title}
          category={data.category}
          userState={data.userState}
          prizePool={data.prizePool}
          entryFee={data.entryFee}
          spotsBooked={data.spotsBooked}
          maxSpots={data.maxSpots}
          spotsLeft={data.spotsLeft}
        />
        <JudgeCard judge={data.judge} />
        {countdownConfig && <CountdownTimer label={countdownConfig.label} targetDate={countdownConfig.targetDate} />}
        <ImportantDatesGrid
          registrationDeadline={data.registrationDeadline}
          submissionStart={data.submissionStart}
          submissionEnd={data.submissionEnd}
          resultDate={data.resultDate}
        />
        <WinnersList winners={data.winners} />
        <TabsSection aboutText={data.aboutText} judgingParamsText={data.judgingParamsText} rulesText={data.rulesText} />
        <RewardsTable rewards={data.rewards} />
      </ScrollView>
      <BottomCTAButton
        ctaState={data.ctaState}
        loading={actionLoading}
        onRegister={handleRegister}
        onSubmit={handleSubmit}
        onViewResults={handleViewResults}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
