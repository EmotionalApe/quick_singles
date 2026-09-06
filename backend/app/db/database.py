from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = "postgresql+psycopg://cricket:cricket@localhost:5432/cricket_scorer"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(
    bind = engine, 
    autoflush=False, 
    autocommit=False
)
class Base(DeclarativeBase): 
    pass