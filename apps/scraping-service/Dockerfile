FROM python:3.11-bookworm
WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl wget gnupg \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxrandr2 libgbm1 libasound2 \
    libpangocairo-1.0-0 libgtk-3-0 \
    libicu72 libjpeg62-turbo \
    fonts-liberation libfontconfig1 \
    libx11-6 libx11-xcb1 libxcb1 libxext6 libxfixes3 \
    libxrender1 libxtst6 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY apps/scraping-service /app
ENV PYTHONPATH=/app

RUN pip install --no-cache-dir \
    --index-url https://pypi.org/simple/ \
    --trusted-host pypi.org \
    --trusted-host files.pythonhosted.org \
    -r requirements.txt

RUN python -m playwright install chromium

CMD ["python", "main.py"]