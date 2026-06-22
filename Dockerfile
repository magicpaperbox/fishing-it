FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.11.7 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY src ./src
COPY templates ./templates
COPY static ./static

EXPOSE 8000

CMD ["sh", "-c", "uv run --no-sync gunicorn --bind 0.0.0.0:${PORT:-8000} 'app:create_app()'"]
