"""
Idempotency Guard — Compatibility Facade
========================================
Delegates to the dedicated app.core.idempotency_mutex module while maintaining
100% backward compatibility for all existing imports.
"""

from app.core.idempotency_mutex import IdempotencyMutex, idempotency_mutex

# Backward-compatibility aliases
IdempotencyGuard = IdempotencyMutex
idempotency_guard = idempotency_mutex
