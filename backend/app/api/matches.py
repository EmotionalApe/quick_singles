from datetime import timedelta
import hashlib
import secrets

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import SessionLocal
from app.models.event import MatchEvent
from app.models.match import Match
from app.schemas.match import (
    InningsScoreResponse,
    MatchCreate,
    MatchCreateResponse,
    MatchResponse,
    MatchResultResponse,
    ScoringEventCreate,
)
from app.services.scoring import (
    calculate_innings_score,
    calculate_match_result,
    innings_is_complete,
    match_is_won_by_chasing,
    validate_event,
)
from app.services.cleanup import cleanup_old_matches


router = APIRouter(prefix="/matches", tags=["matches"])


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def verify_scorer(
    match: Match,
    scorer_token: str | None,
) -> bool:
    if not match.scorer_token_hash or not scorer_token:
        return False

    token_hash = hashlib.sha256(
        scorer_token.encode()
    ).hexdigest()

    return token_hash == match.scorer_token_hash


@router.post("/", response_model=MatchCreateResponse)
def create_match(
    match_data: MatchCreate,
    db: Session = Depends(get_db),
):
    match = Match(
        team_1=match_data.team_1,
        team_2=match_data.team_2,
        overs_per_innings=match_data.overs,
    )

    db.add(match)
    db.commit()
    db.refresh(match)

    return MatchCreateResponse(
        match_id=match.id,
        status=match.status,
    )


@router.get("/{match_id}", response_model=MatchResponse)
def get_match(
    match_id: int,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    scorer_active = match.scorer_token_hash is not None
    viewer_role = "SCORER" if verify_scorer(match, scorer_token) else "VIEWER"

    events = db.scalars(
        select(MatchEvent)
        .where(MatchEvent.match_id == match_id)
        .order_by(MatchEvent.sequence)
    ).all()

    innings_1_events = [
        event for event in events
        if event.innings == 1
    ]

    innings_2_events = [
        event for event in events
        if event.innings == 2
    ]

    innings_1 = calculate_innings_score(innings_1_events)
    innings_2 = calculate_innings_score(innings_2_events)

    result = None
    if match.status == "COMPLETED":
        calculated_result = calculate_match_result(
            match=match,
            first_innings=innings_1,
            second_innings=innings_2,
        )
        result = MatchResultResponse(
            winner=calculated_result.winner,
            type=calculated_result.type,
            margin=calculated_result.margin,
        )

    current_events = innings_2_events if match.current_innings == 2 else innings_1_events
    recent_events: list[str] = []
    for ev in current_events[-12:]:
        if ev.type == "RUN":
            recent_events.append(str(ev.runs))
        elif ev.type == "WICKET":
            recent_events.append("W" if ev.runs == 0 else f"W+{ev.runs}")
        elif ev.type == "WIDE":
            recent_events.append("WD" if ev.runs == 1 else f"{ev.runs}WD")
        elif ev.type == "NO_BALL":
            recent_events.append("NB" if ev.runs == 1 else f"NB+{ev.runs - 1}")

    return MatchResponse(
        match_id=match.id,
        team_1=match.team_1,
        team_2=match.team_2,
        overs_per_innings=match.overs_per_innings,
        current_innings=match.current_innings,
        status=match.status,
        scorer_active=scorer_active,
        viewer_role=viewer_role,
        innings_1=InningsScoreResponse(
            score=innings_1.score,
            wickets=innings_1.wickets,
            overs=innings_1.overs,
        ),
        innings_2=InningsScoreResponse(
            score=innings_2.score,
            wickets=innings_2.wickets,
            overs=innings_2.overs,
        ),
        result=result,
        recent_events=recent_events,
    )


@router.post("/{match_id}/events")
def add_event(
    match_id: int,
    event_data: ScoringEventCreate,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    if not verify_scorer(match, scorer_token):
        raise HTTPException(
            status_code=403,
            detail="Only the active scorer can score this match",
        )

    if match.status not in {"INNINGS_1", "INNINGS_2"}:
        raise HTTPException(
            status_code=400,
            detail="There is no active innings",
        )

    events = db.scalars(
        select(MatchEvent)
        .where(
            MatchEvent.match_id == match_id,
            MatchEvent.innings == match.current_innings,
        )
        .order_by(MatchEvent.sequence)
    ).all()

    current_score = calculate_innings_score(events)

    if innings_is_complete(match, current_score):
        raise HTTPException(
            status_code=400,
            detail="Innings is already complete",
        )

    try:
        runs, legal = validate_event(
            event_data.type,
            event_data.runs,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    sequence = (
        1
        if not events
        else events[-1].sequence + 1
    )

    event = MatchEvent(
        match_id=match_id,
        innings=match.current_innings,
        sequence=sequence,
        type=event_data.type,
        runs=runs,
        legal=legal,
    )

    db.add(event)

    updated_events = events + [event]
    updated_score = calculate_innings_score(updated_events)

    if match.current_innings == 1:
        if innings_is_complete(match, updated_score):
            match.status = "INNINGS_BREAK"

    else:
        first_innings_events = db.scalars(
            select(MatchEvent)
            .where(
                MatchEvent.match_id == match_id,
                MatchEvent.innings == 1,
            )
        ).all()

        first_innings_score = calculate_innings_score(
            first_innings_events
        )

        if match_is_won_by_chasing(
            first_innings_score,
            updated_score,
        ):
            match.status = "COMPLETED"
        elif innings_is_complete(match, updated_score):
            match.status = "COMPLETED"

    db.commit()
    db.refresh(event)

    return {
        "event_id": event.id,
        "type": event.type,
        "runs": event.runs,
        "legal": event.legal,
    }


@router.post("/{match_id}/end-innings")
def end_innings(
    match_id: int,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    if not verify_scorer(match, scorer_token):
        raise HTTPException(
            status_code=403,
            detail="Only the active scorer can end the innings",
        )

    if match.status not in {"INNINGS_1", "INNINGS_2"}:
        raise HTTPException(
            status_code=400,
            detail="There is no active innings to end",
        )

    if match.current_innings == 1:
        match.status = "INNINGS_BREAK"
    else:
        match.status = "COMPLETED"

    db.commit()

    return {
        "status": match.status,
        "current_innings": match.current_innings,
    }


@router.post("/{match_id}/start-innings")
def start_second_innings(
    match_id: int,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    if not verify_scorer(match, scorer_token):
        raise HTTPException(
            status_code=403,
            detail="Only the active scorer can start the innings",
        )

    if (
        match.current_innings != 1
        or match.status != "INNINGS_BREAK"
    ):
        raise HTTPException(
            status_code=400,
            detail="Second innings cannot be started yet",
        )

    match.current_innings = 2
    match.status = "INNINGS_2"

    db.commit()

    return {
        "status": match.status,
        "current_innings": match.current_innings,
    }


@router.post("/{match_id}/scorer")
def join_as_scorer(
    match_id: int,
    response: Response,
    force: bool = False,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    if match.status == "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Match is already completed",
        )

    # If this client is already the active scorer, re-issue/confirm cookie
    if verify_scorer(match, scorer_token):
        response.set_cookie(
            key="scorer_token",
            value=scorer_token,
            httponly=True,
            samesite=settings.COOKIE_SAMESITE,
            secure=settings.cookie_secure,
            domain=settings.COOKIE_DOMAIN,
        )
        return {
            "status": "SCORER",
        }

    # If another scorer is active and not forcing takeover
    if match.scorer_token_hash is not None and not force:
        raise HTTPException(
            status_code=409,
            detail="A scorer is already active",
        )

    new_token = secrets.token_urlsafe(32)
    new_token_hash = hashlib.sha256(
        new_token.encode()
    ).hexdigest()

    match.scorer_token_hash = new_token_hash
    db.commit()

    response.set_cookie(
        key="scorer_token",
        value=new_token,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.cookie_secure,
        domain=settings.COOKIE_DOMAIN,
    )

    return {
        "status": "SCORER",
    }


@router.post("/{match_id}/scorer/leave")
def leave_scorer(
    match_id: int,
    response: Response,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    if not verify_scorer(match, scorer_token):
        raise HTTPException(
            status_code=403,
            detail="You are not the active scorer",
        )

    match.scorer_token_hash = None

    db.commit()

    response.delete_cookie(
        key="scorer_token",
        domain=settings.COOKIE_DOMAIN,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.cookie_secure,
    )

    return {
        "status": "SCORER_LEFT",
    }


@router.post("/{match_id}/undo")
def undo_last_event(
    match_id: int,
    scorer_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    match = db.get(Match, match_id)

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    if not verify_scorer(match, scorer_token):
        raise HTTPException(
            status_code=403,
            detail="Only the active scorer can undo scoring events",
        )

    last_event = db.scalars(
        select(MatchEvent)
        .where(
            MatchEvent.match_id == match_id,
            MatchEvent.innings == match.current_innings,
        )
        .order_by(MatchEvent.sequence.desc())
    ).first()

    if last_event is None:
        raise HTTPException(
            status_code=400,
            detail="No scoring events to undo in current innings",
        )

    db.delete(last_event)
    db.flush()

    remaining_events = db.scalars(
        select(MatchEvent)
        .where(
            MatchEvent.match_id == match_id,
            MatchEvent.innings == match.current_innings,
        )
        .order_by(MatchEvent.sequence)
    ).all()

    current_score = calculate_innings_score(remaining_events)

    if match.current_innings == 1:
        if not innings_is_complete(match, current_score):
            match.status = "INNINGS_1"
    elif match.current_innings == 2:
        first_innings_events = db.scalars(
            select(MatchEvent)
            .where(
                MatchEvent.match_id == match_id,
                MatchEvent.innings == 1,
            )
        ).all()
        first_innings_score = calculate_innings_score(first_innings_events)

        if not match_is_won_by_chasing(first_innings_score, current_score) and not innings_is_complete(match, current_score):
            match.status = "INNINGS_2"

    db.commit()

    return {
        "status": match.status,
        "undone_event_id": last_event.id,
    }


@router.post("/maintenance/cleanup", tags=["maintenance"])
def trigger_cleanup(
    hours: float = 24.0,
    only_completed: bool = False,
    dry_run: bool = False,
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    db: Session = Depends(get_db),
):
    if settings.ADMIN_API_KEY and x_admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing X-Admin-Key header",
        )

    return cleanup_old_matches(
        db=db,
        older_than=timedelta(hours=hours),
        only_completed=only_completed,
        dry_run=dry_run,
    )