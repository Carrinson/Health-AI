from collections.abc import Generator 
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()

# The engine manages a pool of connections, reused across requests. Opening a 
# new TCP connection per request would be slow - doubly so here, where every 
# query crosses an ssh tunnel to Europe

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True, #test a connection before handing it out: 
                        #silently replaces ones the tunnel dropped while idle 
    echo=settings.debug #log every SQL statement when DEBUG=true
                    
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    """Every table class inherits from this. SQLAlchemy uses it to discover
    your models when generating migrations."""


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency: opens a session per request, always closes it.

    The yield/finally shape matters - the session is handed to the endpoint,
    and closed afterwards even if the endpoint raised an exception. 
    Withpput this, a failing request would leak a connection from the pool.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()