import os
from datetime import datetime, timezone
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED
from utils.repo_env import load_root_env

load_root_env()

_scheduler: BackgroundScheduler | None = None


def job_indeed():
    from scrapers.manager import run_scraper
    return run_scraper("indeed")

def job_wttj():
    from scrapers.manager import run_scraper
    return run_scraper("welcometothejungle")

def job_linkedin():
    from scrapers.manager import run_scraper
    return run_scraper("linkedin")

def job_pfebooks():
    from scrapers.manager import run_scraper
    return run_scraper("pfebooks")

def job_archivage():
    from scrapers.manager import archive_old_offres
    archive_old_offres(int(os.getenv("ARCHIVE_AFTER_DAYS", 60)))


def listener(event):
    if event.exception:
        logger.error(f"Job [{event.job_id}] échoué : {event.exception}")
    else:
        logger.success(f"Job [{event.job_id}] terminé")


def start_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler and _scheduler.running:
        return _scheduler

    
    freq_indeed   = int(os.getenv("SCHEDULE_INDEED",   240))  
    freq_wttj     = int(os.getenv("SCHEDULE_WTTJ",      90))  
    freq_li       = int(os.getenv("SCHEDULE_LINKEDIN", 150))  
    freq_pfebooks = int(os.getenv("SCHEDULE_PFEBOOKS",   60))  

    _scheduler = BackgroundScheduler(timezone="UTC")
    _scheduler.add_listener(listener, EVENT_JOB_ERROR | EVENT_JOB_EXECUTED)

    _scheduler.add_job(
        job_indeed,
        IntervalTrigger(minutes=freq_indeed),
        id="indeed",
        max_instances=1,
        misfire_grace_time=300,   
    )
    _scheduler.add_job(
        job_wttj,
        IntervalTrigger(minutes=freq_wttj),
        id="wttj",
        max_instances=1,
        misfire_grace_time=120,
    )
    _scheduler.add_job(
        job_linkedin,
        IntervalTrigger(minutes=freq_li),
        id="linkedin",
        max_instances=1,
        misfire_grace_time=120,
    )
    _scheduler.add_job(
        job_pfebooks,
        IntervalTrigger(minutes=freq_pfebooks),
        id="pfebooks",
        max_instances=1,
        misfire_grace_time=300,
    )
    _scheduler.add_job(
        job_archivage,
        "cron",
        hour=3,
        minute=0,
        id="archivage",
        misfire_grace_time=3600,
    )

    _scheduler.start()
    logger.success(
        f"Scheduler démarré — Indeed:{freq_indeed}min | WTTJ:{freq_wttj}min | "
        f"LinkedIn:{freq_li}min | PFEBooks:{freq_pfebooks}min"
    )
    return _scheduler


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler arrêté")