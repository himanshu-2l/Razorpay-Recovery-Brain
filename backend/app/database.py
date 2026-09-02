"""
Enterprise Database Engine — Async PostgreSQL & SQLite Mutex
============================================================
Implements production-grade asynchronous connection pooling for PostgreSQL 15:
- Engine: SQLAlchemy 2.0 + asyncpg driver
- Connection Pooling: pool_size=20, max_overflow=40, pool_pre_ping=True
- Fallback Engine: SQLite with aiosqlite for zero-dependency local testing
- Separate Mutex: Dedicated SQLite WAL mutex connection for file-level idempotency locking
"""

import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import DATABASE_URL
from app.core.idempotency_mutex import idempotency_mutex

logger = logging.getLogger(__name__)

Base = declarative_base()


def create_engine_for_url(url: str):
    """
    Construct async engine. If PostgreSQL, applies high-throughput connection pool settings.
    If SQLite, uses connection settings suitable for local development/testing.
    """
    if url.startswith("postgresql"):
        logger.info("Initializing Enterprise PostgreSQL 15 Async Engine (asyncpg with connection pooling).")
        return create_async_engine(
            url,
            pool_size=20,
            max_overflow=40,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False,
        )
    else:
        # SQLite Async fallback for local zero-dependency testing
        logger.info("Initializing SQLite Async Engine (aiosqlite).")
        return create_async_engine(
            url if url.startswith("sqlite") else "sqlite+aiosqlite:///./recovery_brain.db",
            echo=False,
        )


# Global async engine & session factory
engine = create_engine_for_url(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for yielding transactional async sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all relational tables asynchronously."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")
