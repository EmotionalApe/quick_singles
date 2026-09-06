from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

class Match(Base):
    __tablename__ = 'matches'

    id : Mapped[int] = mapped_column(Integer, primary_key=True)
    team_1 : Mapped[str] = mapped_column(String(100), nullable=False)
    team_2 : Mapped[str] = mapped_column(String(100), nullable=False)
    overs_per_innings : Mapped[int] = mapped_column(Integer, nullable=False)
    current_innings : Mapped[int] = mapped_column(Integer, default = 1, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        default="INNINGS_1",
        nullable=False,
    )
    scorer_token_hash : Mapped[str | None] = mapped_column(
        String(64),
        nullable=True
    )
    created_at : Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow,nullable=False)
    