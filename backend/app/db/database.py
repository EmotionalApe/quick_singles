from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

is_postgres = DATABASE_URL.startswith("postgresql")
engine_kwargs = {}
if is_postgres:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 300,
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(
    bind=engine, 
    autoflush=False, 
    autocommit=False
)
class Base(DeclarativeBase): 
    pass