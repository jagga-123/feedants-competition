/**
 * Derives the competition's live status by comparing the current time against
 * its date fields. This is computed fresh on every read and is never trusted
 * from the stored `status` field, which is only a cached/cron-updated fallback.
 */
function computeStatus(competition) {
  const now = new Date();
  const { registrationDeadline, submissionStart, submissionEnd, resultDate } = competition;

  if (now < new Date(registrationDeadline)) {
    return 'registration_open';
  }
  if (now < new Date(submissionStart)) {
    return 'registration_closed';
  }
  if (now < new Date(submissionEnd)) {
    return 'submission_open';
  }
  if (now < new Date(resultDate)) {
    return 'closed';
  }
  return 'results_declared';
}

module.exports = computeStatus;
