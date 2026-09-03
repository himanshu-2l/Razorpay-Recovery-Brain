"""
Application Configuration Facade (app.config)
==============================================
Maintains 100% backward-compatibility by re-exporting all settings from app.core.config.
New code should import directly from app.core.config.
"""

from app.core.config import *
