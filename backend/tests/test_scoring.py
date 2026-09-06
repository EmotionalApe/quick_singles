from types import SimpleNamespace

import pytest

from app.services.scoring import (
    calculate_innings_score,
    calculate_match_result,
    innings_is_complete,
    match_is_won_by_chasing,
    validate_event,
)


def make_event(
    event_type: str,
    runs: int,
    legal: bool,
):
    return SimpleNamespace(
        type=event_type,
        runs=runs,
        legal=legal,
    )


def make_match(overs: int, team1: str = "Team A", team2: str = "Team B"):
    return SimpleNamespace(
        overs_per_innings=overs,
        team_1=team1,
        team_2=team2,
    )


def test_normal_runs():
    events = [
        make_event("RUN", 1, True),
        make_event("RUN", 4, True),
        make_event("RUN", 6, True),
    ]

    score = calculate_innings_score(events)

    assert score.score == 11
    assert score.wickets == 0
    assert score.legal_balls == 3
    assert score.overs == "0.3"


def test_wide_does_not_count_as_legal_ball():
    events = [
        make_event("RUN", 1, True),
        make_event("WIDE", 1, False),
        make_event("RUN", 4, True),
    ]

    score = calculate_innings_score(events)

    assert score.score == 6
    assert score.legal_balls == 2
    assert score.overs == "0.2"


def test_wicket():
    events = [
        make_event("RUN", 2, True),
        make_event("WICKET", 0, True),
    ]

    score = calculate_innings_score(events)

    assert score.score == 2
    assert score.wickets == 1
    assert score.legal_balls == 2


def test_valid_run_values():
    for runs in [0, 1, 2, 3, 4, 6]:
        assert validate_event("RUN", runs) == (runs, True)


def test_invalid_run_value():
    with pytest.raises(ValueError):
        validate_event("RUN", 5)


def test_wide():
    assert validate_event("WIDE", None) == (1, False)
    assert validate_event("WIDE", 0) == (1, False)
    assert validate_event("WIDE", 1) == (2, False)
    assert validate_event("WIDE", 4) == (5, False)


def test_no_ball():
    assert validate_event("NO_BALL", None) == (1, False)
    assert validate_event("NO_BALL", 0) == (1, False)
    assert validate_event("NO_BALL", 1) == (2, False)
    assert validate_event("NO_BALL", 4) == (5, False)
    assert validate_event("NO_BALL", 6) == (7, False)


def test_wicket():
    assert validate_event("WICKET", None) == (0, True)
    assert validate_event("WICKET", 0) == (0, True)
    assert validate_event("WICKET", 1) == (1, True)
    assert validate_event("WICKET", 2) == (2, True)



def test_overs_exhaustion():
    match = make_match(2)

    score = calculate_innings_score([
        make_event("RUN", 1, True)
        for _ in range(12)
    ])

    assert innings_is_complete(match, score)


def test_overs_not_yet_exhausted():
    match = make_match(2)

    score = calculate_innings_score([
        make_event("RUN", 1, True)
        for _ in range(11)
    ])

    assert not innings_is_complete(match, score)


def test_chasing_team_wins():
    first = calculate_innings_score([
        make_event("RUN", 10, True),
    ])

    second = calculate_innings_score([
        make_event("RUN", 11, True),
    ])

    assert match_is_won_by_chasing(first, second)


def test_defending_team_wins():
    match = make_match(2)

    first = calculate_innings_score([
        make_event("RUN", 20, True),
    ])

    second = calculate_innings_score([
        make_event("RUN", 15, True),
    ])

    result = calculate_match_result(match, first, second)

    assert result.winner == "Team A"
    assert result.type == "RUNS"
    assert result.margin == 5


def test_chasing_team_result():
    match = make_match(2)

    first = calculate_innings_score([
        make_event("RUN", 20, True),
    ])

    second = calculate_innings_score([
        make_event("RUN", 21, True),
    ])

    result = calculate_match_result(match, first, second)

    assert result.winner == "Team B"
    assert result.type == "CHASE"


def test_tie():
    match = make_match(2)

    first = calculate_innings_score([
        make_event("RUN", 20, True),
    ])

    second = calculate_innings_score([
        make_event("RUN", 20, True),
    ])

    result = calculate_match_result(match, first, second)

    assert result.winner is None
    assert result.type == "TIE"
    assert result.margin == 0