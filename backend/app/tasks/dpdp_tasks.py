"""
DPDP Act 2023 Background Tasks
==============================
Automated retention schedule enforcement and daily cleanup tasks.
Can be executed via Celery, APScheduler, or FastAPI background cron.
"""

import logging
from datetime import datetime, timezone
from app.core.dpdp_compliance import dpdp_data_retention

logger = logging.getLogger(__name__)


def daily_data_cleanup():
    """
    Daily statutory retention sweep (scheduled at 2:00 AM IST).
    Scans scheduled entity deletions and hard-purges expired voice audio
    (>90 days) and call transcripts (>180 days).
    """
    logger.info("Executing statutory DPDP Act 2023 daily data retention cleanup...")
    result = dpdp_data_retention.execute_deletion()
    logger.info(
        f"DPDP Daily Cleanup Complete: Purged {result['purged_count']} expired records, "
        f"{result['retained_count']} active entities within statutory retention window."
    )
    return result
