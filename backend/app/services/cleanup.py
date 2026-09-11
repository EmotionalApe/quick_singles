from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.event import MatchEvent
from app.models.match import Match


def cleanup_old_matches(
    db: Session,
    older_than: timedelta,
    only_completed: bool = False,
    dry_run: bool = False,
) -> dict:
    """
    Deletes matches and their associated events created before (now - older_than).
    
    Returns a dictionary summarizing the operation.
    """
    # Use timezone-naive UTC to match DateTime() default in models
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - older_than

    # Query matches to delete
    stmt = select(Match.id).where(Match.created_at < cutoff)
    if only_completed:
        stmt = stmt.where(Match.status == "COMPLETED")

    match_ids = list(db.scalars(stmt).all())

    if not match_ids:
        return {
            "cutoff": cutoff.isoformat(),
            "matches_found": 0,
            "deleted_matches": 0,
            "deleted_events": 0,
            "dry_run": dry_run,
        }

    # Count events to be deleted
    events_stmt = select(MatchEvent.id).where(MatchEvent.match_id.in_(match_ids))
    event_ids = list(db.scalars(events_stmt).all())

    if dry_run:
        return {
            "cutoff": cutoff.isoformat(),
            "matches_found": len(match_ids),
            "deleted_matches": 0,
            "deleted_events": 0,
            "would_delete_matches": len(match_ids),
            "would_delete_events": len(event_ids),
            "dry_run": True,
        }

    # Delete dependent match_events first to satisfy foreign key constraints
    deleted_events = db.execute(
        delete(MatchEvent).where(MatchEvent.match_id.in_(match_ids))
    ).rowcount

    # Delete matches
    deleted_matches = db.execute(
        delete(Match).where(Match.id.in_(match_ids))
    ).rowcount

    db.commit()

    return {
        "cutoff": cutoff.isoformat(),
        "matches_found": len(match_ids),
        "deleted_matches": deleted_matches,
        "deleted_events": deleted_events,
        "dry_run": False,
    }
