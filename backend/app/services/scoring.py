from dataclasses import dataclass

from app.models.event import MatchEvent
from app.models.match import Match


@dataclass
class InningsScore:
    score: int
    wickets: int
    legal_balls: int

    @property
    def overs(self) -> str:
        return f"{self.legal_balls // 6}.{self.legal_balls % 6}"

@dataclass
class MatchResult:
    winner : str | None
    type : str
    margin : int


def calculate_innings_score(
    events: list[MatchEvent],
) -> InningsScore:
    score = 0
    wickets = 0
    legal_balls = 0

    for event in events:
        score += event.runs

        if event.type == "WICKET":
            wickets += 1

        if event.legal:
            legal_balls += 1

    return InningsScore(
        score=score,
        wickets=wickets,
        legal_balls=legal_balls,
    )


def validate_event(event_type: str, runs: int | None) -> tuple[int, bool]:
    if event_type == "RUN":
        if runs not in {0, 1, 2, 3, 4, 6}:
            raise ValueError(
                "Runs must be one of 0, 1, 2, 3, 4 or 6"
            )
        return runs, True

    if event_type == "WIDE":
        extra_runs = runs if runs is not None else 0
        if extra_runs not in {0, 1, 2, 3, 4}:
            raise ValueError("Extra runs on wide must be between 0 and 4")
        return 1 + extra_runs, False

    if event_type == "NO_BALL":
        bat_runs = runs if runs is not None else 0
        if bat_runs not in {0, 1, 2, 3, 4, 6}:
            raise ValueError("Runs off no ball must be one of 0, 1, 2, 3, 4 or 6")
        return 1 + bat_runs, False

    if event_type == "WICKET":
        completed_runs = runs if runs is not None else 0
        if completed_runs not in {0, 1, 2, 3}:
            raise ValueError("Completed runs on wicket must be between 0 and 3")
        return completed_runs, True

    raise ValueError("Invalid event type")



def innings_is_complete(
    match: Match,
    innings_score: InningsScore,
) -> bool:
    maximum_legal_balls = match.overs_per_innings * 6

    return innings_score.legal_balls >= maximum_legal_balls


def match_is_won_by_chasing(
    first_innings: InningsScore,
    second_innings: InningsScore,
) -> bool:
    return second_innings.score > first_innings.score

def calculate_match_result(
    match: Match,
    first_innings: InningsScore,
    second_innings: InningsScore,
) -> MatchResult:
    if second_innings.score > first_innings.score:
        return MatchResult(
            winner=match.team_2,
            type="CHASE",
            margin=0,
        )

    if second_innings.score < first_innings.score:
        return MatchResult(
            winner=match.team_1,
            type="RUNS",
            margin=first_innings.score - second_innings.score,
        )

    return MatchResult(
        winner=None,
        type="TIE",
        margin=0,
    )