import axios, { AxiosError } from 'axios';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CompetitionDetails,
  RegisterResponseData,
  SubmitResponseData,
  Winner,
} from '../constants/types';

// EXPO_PUBLIC_* vars are inlined by Expo at build time.
// Note: the Android emulator can't reach the host machine via "localhost" —
// use 10.0.2.2 instead (e.g. EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api).
// iOS simulator can use localhost; a physical device needs the host's LAN IP.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export interface NormalizedApiError {
  message: string;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message = axiosError.response?.data?.message;
    if (message) {
      return { message };
    }
    if (axiosError.message) {
      return { message: axiosError.message };
    }
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Something went wrong. Please try again.' };
}

export async function getCompetitionDetails(id: string, userId?: string): Promise<CompetitionDetails> {
  const response = await apiClient.get<ApiSuccessResponse<CompetitionDetails>>(`/competitions/${id}`, {
    params: userId ? { userId } : undefined,
  });
  return response.data.data;
}

export interface RegisterPayload {
  userId: string;
  referralCode?: string;
}

export async function registerForCompetition(
  id: string,
  payload: RegisterPayload
): Promise<RegisterResponseData> {
  const response = await apiClient.post<ApiSuccessResponse<RegisterResponseData>>(
    `/competitions/${id}/register`,
    payload
  );
  return response.data.data;
}

export interface SubmitPayload {
  userId: string;
  fileUrl: string;
}

export async function submitForCompetition(id: string, payload: SubmitPayload): Promise<SubmitResponseData> {
  const response = await apiClient.post<ApiSuccessResponse<SubmitResponseData>>(
    `/competitions/${id}/submit`,
    payload
  );
  return response.data.data;
}

export async function getWinners(id: string): Promise<Winner[]> {
  const response = await apiClient.get<ApiSuccessResponse<Winner[]>>(`/competitions/${id}/winners`);
  return response.data.data;
}
