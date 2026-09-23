export type LiveStatus =
  | 'registration_open'
  | 'registration_closed'
  | 'submission_open'
  | 'closed'
  | 'results_declared';

export type UserState = 'not_registered' | 'registered' | 'submitted' | null;

export type CtaState =
  | 'can_register'
  | 'already_registered'
  | 'registration_closed'
  | 'can_submit'
  | 'already_submitted'
  | 'awaiting_results'
  | 'view_results';

export interface Judge {
  _id: string;
  name: string;
  photo?: string;
  bio?: string;
  experienceText?: string;
  introVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  position: number;
  label: string;
  amount: number;
}

export interface Winner {
  _id: string;
  competitionId: string;
  // Populated server-side (name only) so non-guest winners have a displayable name.
  userId?: { _id: string; name: string };
  guestName?: string;
  guestPhoto?: string;
  position: number;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionDetails {
  id: string;
  title: string;
  category: string[];
  prizePool: number;
  entryFee: number;
  maxSpots: number;
  spotsBooked: number;
  spotsLeft: number;
  judge: Judge | null;
  registrationDeadline: string;
  submissionStart: string;
  submissionEnd: string;
  resultDate: string;
  aboutText?: string;
  judgingParamsText?: string;
  rulesText?: string;
  rewards: Reward[];
  referralBaseAmount?: number;
  liveStatus: LiveStatus;
  userState: UserState;
  ctaState: CtaState;
  winners: Winner[];
}

export interface RegisterResponseData {
  registrationId: string;
  userState: 'registered';
  ctaState: CtaState;
}

export interface SubmitResponseData {
  submissionId: string;
  userState: 'submitted';
  ctaState: CtaState;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}
