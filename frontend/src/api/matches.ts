import { api } from './client';
import type {
  Match,
  MatchCreateRequest,
  MatchCreateResponse,
  ScoringEventRequest,
} from '../types/match';

export async function createMatch(
  data: MatchCreateRequest
): Promise<MatchCreateResponse> {
  const response = await api.post<MatchCreateResponse>('/matches/', data);
  return response.data;
}

export async function getMatch(matchId: number): Promise<Match> {
  const response = await api.get<Match>(`/matches/${matchId}`);
  return response.data;
}

export async function joinAsScorer(
  matchId: number,
  force: boolean = false
): Promise<{ status: string }> {
  const response = await api.post<{ status: string }>(
    `/matches/${matchId}/scorer`,
    null,
    { params: { force } }
  );
  return response.data;
}

export async function leaveScorer(
  matchId: number
): Promise<{ status: string }> {
  const response = await api.post<{ status: string }>(
    `/matches/${matchId}/scorer/leave`
  );
  return response.data;
}

export async function scoreEvent(
  matchId: number,
  event: ScoringEventRequest
): Promise<{ event_id: number; type: string; runs: number; legal: boolean }> {
  const response = await api.post(
    `/matches/${matchId}/events`,
    event
  );
  return response.data;
}

export async function endInnings(
  matchId: number
): Promise<{ status: string; current_innings: number }> {
  const response = await api.post<{ status: string; current_innings: number }>(
    `/matches/${matchId}/end-innings`
  );
  return response.data;
}

export async function startInnings(
  matchId: number
): Promise<{ status: string; current_innings: number }> {
  const response = await api.post<{ status: string; current_innings: number }>(
    `/matches/${matchId}/start-innings`
  );
  return response.data;
}

export async function undoLastEvent(
  matchId: number
): Promise<{ status: string; undone_event_id: number }> {
  const response = await api.post<{ status: string; undone_event_id: number }>(
    `/matches/${matchId}/undo`
  );
  return response.data;
}
