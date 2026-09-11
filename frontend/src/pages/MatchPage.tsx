import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Scoreboard } from '../components/Scoreboard';
import { RecentEvents } from '../components/RecentEvents';
import { ScoringControls } from '../components/ScoringControls';
import { ScorerActions } from '../components/ScorerActions';
import { InningsBreakCard } from '../components/InningsBreakCard';
import { MatchResultCard } from '../components/MatchResultCard';
import { ShareModal } from '../components/ShareModal';
import { NetworkBanner } from '../components/NetworkBanner';
import { SyncBar } from '../components/SyncBar';
import {
  getMatch,
  joinAsScorer,
  leaveScorer,
  scoreEvent,
  endInnings,
  startInnings,
  undoLastEvent,
} from '../api/matches';
import type { Match, EventType } from '../types/match';

export const MatchPage: React.FC = () => {
  const { matchId: paramMatchId } = useParams<{ matchId: string }>();
  const matchId = Number(paramMatchId);

  const location = useLocation();
  const isNewMatch = Boolean(location.state?.isNewMatch);

  const [match, setMatch] = useState<Match | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals & Action States
  const [shareModalOpen, setShareModalOpen] = useState(isNewMatch);
  const [isScoring, setIsScoring] = useState(false);
  const [isJoiningScorer, setIsJoiningScorer] = useState(false);
  const [scorerConflictMessage, setScorerConflictMessage] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Fetch match state
  const fetchMatchState = useCallback(async (isSilent = false) => {
    if (!matchId || isNaN(matchId)) {
      setNotFound(true);
      setInitialLoading(false);
      return;
    }

    try {
      const data = await getMatch(matchId);
      if (!isMountedRef.current) return;
      setMatch(data);
      setLastSyncedAt(new Date());
      setNetworkError(false);
      setNotFound(false);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setNetworkError(true);
      }
    } finally {
      if (!isSilent && isMountedRef.current) {
        setInitialLoading(false);
      }
    }
  }, [matchId]);

  // Initial load on mount (no automatic polling)
  useEffect(() => {
    isMountedRef.current = true;
    fetchMatchState(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchMatchState]);

  // Manual score sync
  const handleManualSync = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      await fetchMatchState(true);
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  };

  // Join as Scorer
  const handleJoinScorer = async (force: boolean = false) => {
    setActionError(null);
    setScorerConflictMessage(null);
    try {
      setIsJoiningScorer(true);
      await joinAsScorer(matchId, force);
      await fetchMatchState(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setScorerConflictMessage('Someone else is currently scoring this match.');
      } else if (err.response?.status === 400) {
        setActionError(err.response?.data?.detail || 'Cannot join as scorer.');
      } else {
        setActionError('Failed to join as scorer. Please try again.');
      }
    } finally {
      setIsJoiningScorer(false);
    }
  };

  // Leave Scorer
  const handleLeaveScorer = async () => {
    setActionError(null);
    try {
      await leaveScorer(matchId);
      await fetchMatchState(true);
    } catch (err: any) {
      setActionError(
        err.response?.data?.detail || 'Failed to leave scorer role.'
      );
      await fetchMatchState(true);
    }
  };

  // Score delivery event
  const handleScoreEvent = async (type: EventType, runs?: number) => {
    if (isScoring) return;
    setActionError(null);

    try {
      setIsScoring(true);
      await scoreEvent(matchId, { type, runs });
      await fetchMatchState(true);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setActionError('Your scorer session is no longer active.');
        await fetchMatchState(true);
      } else {
        setActionError(
          err.response?.data?.detail || 'Failed to register delivery.'
        );
      }
    } finally {
      setIsScoring(false);
    }
  };

  // Undo last ball
  const handleUndo = async () => {
    setActionError(null);
    try {
      setIsScoring(true);
      await undoLastEvent(matchId);
      await fetchMatchState(true);
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Cannot undo delivery.');
    } finally {
      setIsScoring(false);
    }
  };

  // End innings manually
  const handleEndInnings = async () => {
    setActionError(null);
    try {
      setIsScoring(true);
      await endInnings(matchId);
      await fetchMatchState(true);
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to end innings.');
    } finally {
      setIsScoring(false);
    }
  };

  // Start second innings
  const handleStartSecondInnings = async () => {
    setActionError(null);
    try {
      setIsScoring(true);
      await startInnings(matchId);
      await fetchMatchState(true);
    } catch (err: any) {
      setActionError(
        err.response?.data?.detail || 'Failed to start second innings.'
      );
    } finally {
      setIsScoring(false);
    }
  };

  // Render 404
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm space-y-3 rounded-2xl border-2 border-black bg-white p-6 shadow-[3px_3px_0px_#000]">
            <h1 className="text-lg font-black text-black">Match Not Found</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              The link may be invalid or the match no longer exists.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="rounded-xl border-2 border-black bg-[#ffd260] px-4 py-2 text-xs font-black text-black shadow-[2px_2px_0px_#000]"
              >
                Go Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render Initial Skeleton
  if (initialLoading || !match) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-3">
            <div className="h-28 rounded-2xl border-2 border-black/20 bg-white/60 animate-pulse" />
            <div className="h-10 rounded-xl border-2 border-black/20 bg-white/60 animate-pulse" />
            <div className="h-36 rounded-2xl border-2 border-black/20 bg-white/60 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  const isScorer = match.viewer_role === 'SCORER';
  const isMatchComplete = match.status === 'COMPLETED';
  const isInningsBreak = match.status === 'INNINGS_BREAK';
  const isLiveInnings = match.status === 'INNINGS_1' || match.status === 'INNINGS_2';

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black pb-4">
      <Navbar
        matchId={match.match_id}
        role={match.viewer_role}
        onShareClick={() => setShareModalOpen(true)}
      />

      <main className={`mx-auto w-full max-w-md flex-1 px-3 sm:px-4 py-3 ${isScorer ? 'space-y-2' : 'space-y-3'}`}>
        {/* Network Retry Notification */}
        <NetworkBanner isRetrying={networkError} />

        {/* Transient Action Error */}
        {actionError && (
          <div className="rounded-xl border border-black bg-[#fee2e2] p-2 text-xs font-bold text-black flex items-center justify-between gap-2 shadow-[1px_1px_0px_#000]">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="font-bold text-black hover:opacity-60"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scorer Conflict Alert */}
        {scorerConflictMessage && (
          <div className="rounded-xl border-2 border-black bg-white p-3 text-center space-y-2 shadow-[2px_2px_0px_#000]">
            <p className="text-xs font-bold text-black">
              {scorerConflictMessage}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setScorerConflictMessage(null)}
                className="rounded-lg border border-black bg-white px-2.5 py-1 text-xs font-bold text-black hover:bg-slate-50"
              >
                View Only
              </button>
              <button
                type="button"
                disabled={isJoiningScorer}
                onClick={() => handleJoinScorer(true)}
                className="rounded-lg border-2 border-black bg-[#ffd260] px-3 py-1 text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all disabled:opacity-50"
              >
                {isJoiningScorer ? 'Taking Over...' : 'Take Over Scorer'}
              </button>
            </div>
          </div>
        )}

        {/* Scoreboard Display (compact in scorer mode for zero-scroll viewport) */}
        <Scoreboard match={match} compact={isScorer && isLiveInnings} />

        {/* Sync Bar for Viewers or outside live scoring */}
        {(!isScorer || !isLiveInnings) && (
          <SyncBar
            lastSyncedAt={lastSyncedAt}
            isSyncing={isSyncing}
            onSync={handleManualSync}
          />
        )}

        {/* Recent Scoring Balls */}
        <RecentEvents events={match.recent_events || []} />

        {/* Innings Break Mode */}
        {isInningsBreak && (
          <InningsBreakCard
            match={match}
            onStartSecondInnings={handleStartSecondInnings}
          />
        )}

        {/* Match Completed Mode */}
        {isMatchComplete && <MatchResultCard match={match} />}

        {/* Viewer CTA: Join as Scorer (Only if match not completed) */}
        {!isScorer && !isMatchComplete && (
          <div className="rounded-2xl border-2 border-black bg-white p-4 text-center space-y-2 shadow-[3px_3px_0px_#000]">
            <div className="text-xs font-bold text-slate-500">
              {match.scorer_active
                ? 'A scorer is currently recording this match.'
                : 'No active scorer.'}
            </div>
            <button
              type="button"
              disabled={isJoiningScorer}
              onClick={() => handleJoinScorer(false)}
              className="w-full rounded-xl border-2 border-black bg-[#ffd260] py-2 px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all disabled:opacity-50"
            >
              {isJoiningScorer ? 'Joining...' : 'Score This Match'}
            </button>
          </div>
        )}

        {/* Scorer Controls & Actions (Only during live innings) */}
        {isScorer && isLiveInnings && (
          <div className="space-y-2 pt-0.5">
            <ScoringControls
              onScore={handleScoreEvent}
              disabled={isScoring}
            />

            <ScorerActions
              onUndo={handleUndo}
              onEndInnings={handleEndInnings}
              onLeaveScorer={handleLeaveScorer}
              onSync={handleManualSync}
              isSyncing={isSyncing}
              lastSyncedAt={lastSyncedAt}
              disabled={isScoring}
            />
          </div>
        )}

        {/* If Scorer during Innings Break or Completed: allow leaving scorer role */}
        {isScorer && !isLiveInnings && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleLeaveScorer}
              className="rounded-xl border border-black bg-white px-3 py-1 text-xs font-bold text-black shadow-[1px_1px_0px_#000] hover:bg-slate-50"
            >
              Leave Scorer Role
            </button>
          </div>
        )}
      </main>

      {/* Reusable Share Modal */}
      <ShareModal
        matchId={match.match_id}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
};
