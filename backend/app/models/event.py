from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column 
from app.db.database import Base

class MatchEvent(Base):
    __tablename__ = "match_events"

    id : Mapped[int] = mapped_column(Integer, primary_key=True)
    match_id : Mapped[int] = mapped_column(ForeignKey("matches.id"),nullable=False)
    innings : Mapped[int] = mapped_column(Integer,nullable=False)
    sequence : Mapped[int] = mapped_column(Integer,nullable=False)
    type : Mapped[str] = mapped_column(String(20),nullable=False)
    runs : Mapped[int] = mapped_column(Integer,default=0,nullable=False)
    legal : Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime(), default=datetime.utcnow,nullable=False)