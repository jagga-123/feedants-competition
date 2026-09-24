/**
 * Derives the competition's live status by comparing the current time against
 * its date fields. This is computed fresh on every read and is never trusted
 * from the stored `status` field, which is only a cached/cron-updated fallback.
 *
 * The submission window is evaluated first and independently of the
 * registration deadline: submissionStart may precede registrationDeadline, in
 * which case submissions are open while registration is still open too.
 */
function computeStatus(competition) {
  const now = new Date();
  const { registrationDeadline, submissionStart, submissionEnd, resultDate } = competition;

  if (now >= new Date(submissionStart) && now < new Date(submissionEnd)) {
    return 'submission_open';
  }
  if (now < new Date(submissionStart)) {
    return now < new Date(registrationDeadline) ? 'registration_open' : 'registration_closed';
  }
  return now < new Date(resultDate) ? 'closed' : 'results_declared';
}

/**
 * Whether new registrations are still accepted. Tracked separately from the
 * live status because during an overlapping window the status is
 * 'submission_open' even though registration hasn't closed yet.
 */
function isRegistrationOpen(competition) {
  return new Date() < new Date(competition.registrationDeadline);
}

module.exports = { computeStatus, isRegistrationOpen };
