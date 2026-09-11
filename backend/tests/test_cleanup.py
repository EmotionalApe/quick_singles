from datetime import datetime, timedelta, timezone
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.db.database import Base
from app.models.event import MatchEvent
from app.models.match import Match
from app.services.cleanup import cleanup_old_matches


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_cleanup_deletes_old_matches_and_events(db_session):
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # 1 old match (created 48 hours ago) with 2 events
    old_match = Match(
        team_1="Old 1",
        team_2="Old 2",
        overs_per_innings=5,
        status="COMPLETED",
        created_at=now - timedelta(hours=48),
    )
    db_session.add(old_match)
    db_session.flush()

    event_1 = MatchEvent(
        match_id=old_match.id,
        innings=1,
        sequence=1,
        type="RUN",
        runs=4,
        legal=True,
        created_at=now - timedelta(hours=48),
    )
    event_2 = MatchEvent(
        match_id=old_match.id,
        innings=1,
        sequence=2,
        type="WICKET",
        runs=0,
        legal=True,
        created_at=now - timedelta(hours=48),
    )
    db_session.add_all([event_1, event_2])

    # 1 recent match (created 2 hours ago) with 1 event
    recent_match = Match(
        team_1="Recent 1",
        team_2="Recent 2",
        overs_per_innings=5,
        status="INNINGS_1",
        created_at=now - timedelta(hours=2),
    )
    db_session.add(recent_match)
    db_session.flush()

    event_3 = MatchEvent(
        match_id=recent_match.id,
        innings=1,
        sequence=1,
        type="RUN",
        runs=1,
        legal=True,
        created_at=now - timedelta(hours=2),
    )
    db_session.add(event_3)
    db_session.commit()

    # Dry run check first
    dry_result = cleanup_old_matches(
        db=db_session,
        older_than=timedelta(hours=24),
        dry_run=True,
    )
    assert dry_result["matches_found"] == 1
    assert dry_result["would_delete_matches"] == 1
    assert dry_result["would_delete_events"] == 2
    assert dry_result["deleted_matches"] == 0

    # Ensure nothing was deleted during dry run
    remaining_matches = db_session.scalars(select(Match)).all()
    assert len(remaining_matches) == 2

    # Execute real cleanup (older than 24 hours)
    result = cleanup_old_matches(
        db=db_session,
        older_than=timedelta(hours=24),
        dry_run=False,
    )
    assert result["matches_found"] == 1
    assert result["deleted_matches"] == 1
    assert result["deleted_events"] == 2

    # Verify database state: only recent match and its event remain
    remaining_matches = db_session.scalars(select(Match)).all()
    assert len(remaining_matches) == 1
    assert remaining_matches[0].id == recent_match.id

    remaining_events = db_session.scalars(select(MatchEvent)).all()
    assert len(remaining_events) == 1
    assert remaining_events[0].id == event_3.id


def test_cleanup_only_completed_filter(db_session):
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Old match that is in progress
    in_progress = Match(
        team_1="Team A",
        team_2="Team B",
        overs_per_innings=5,
        status="INNINGS_1",
        created_at=now - timedelta(hours=48),
    )
    # Old match that is completed
    completed = Match(
        team_1="Team C",
        team_2="Team D",
        overs_per_innings=5,
        status="COMPLETED",
        created_at=now - timedelta(hours=48),
    )
    db_session.add_all([in_progress, completed])
    db_session.commit()

    # Cleanup with only_completed=True
    result = cleanup_old_matches(
        db=db_session,
        older_than=timedelta(hours=24),
        only_completed=True,
    )
    assert result["deleted_matches"] == 1

    # Ensure in_progress still exists
    remaining = db_session.scalars(select(Match)).all()
    assert len(remaining) == 1
    assert remaining[0].status == "INNINGS_1"
