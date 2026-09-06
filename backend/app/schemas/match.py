from pydantic import BaseModel, Field
from typing import Literal

class MatchCreate(BaseModel):
    team_1 : str = Field(min_length=1, max_length=100) 
    team_2 : str = Field(min_length=1, max_length=100) 
    overs : int = Field(gt=0, le=100)

class MatchCreateResponse(BaseModel):
    match_id : int
    status : str

class InningsScoreResponse(BaseModel):
    score: int
    wickets: int
    overs: str

class MatchResultResponse(BaseModel):
    winner: str | None
    type: str
    margin: int

class MatchResponse(BaseModel):
    match_id: int
    team_1: str
    team_2: str
    overs_per_innings: int
    current_innings: int
    status: str
    scorer_active: bool
    viewer_role: str
    innings_1: InningsScoreResponse
    innings_2: InningsScoreResponse
    result : MatchResultResponse | None
    recent_events: list[str] = Field(default_factory=list)

class ScoringEventCreate(BaseModel):
    type : Literal["RUN", "WICKET", "NO_BALL", "WIDE"]
    runs : int | None = None

