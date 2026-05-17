import sys, os
import uvicorn
from loguru import logger

from utils.repo_env import load_root_env

load_root_env()

os.makedirs("logs", exist_ok=True)
logger.remove()
logger.add(sys.stdout,
    level=os.getenv("SCRAPING_LOG_LEVEL", "INFO"),
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
    colorize=True,
)
logger.add("logs/scraper.log", rotation="10 MB", retention="30 days", level="DEBUG", encoding="utf-8")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 3002))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"Scraping Service demarrage sur {host}:{port}")

    # FastAPI démarre l'API + le scheduler via lifespan
    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="warning",
    )
