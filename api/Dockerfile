# Slim base — the API only needs to load saved models, not train them,
# so we don't need the full Python image or any of ml/'s heavy dependencies.
FROM python:3.12-slim

# uv is installed via its official standalone binary rather than pip,
# so it's available before any project dependencies are resolved.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files FIRST, before the rest of the code. Docker caches
# each layer — if only your app code changes (which is most of the time),
# this layer is reused and `uv sync` doesn't re-run, saving real minutes
# on every rebuild.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Now copy everything else — app code, alembic migrations, saved models.
COPY . .

# The port FastAPI/uvicorn listens on inside the container. This is
# metadata for humans and tools reading the Dockerfile — it does not
# actually publish the port; that happens in docker-compose.yml.
EXPOSE 8000

# 0.0.0.0 is required here for the same reason it was required on your
# laptop tonight: inside the container, "localhost" would only accept
# connections from within the container itself, and nginx (a separate
# container) needs to reach this one over the network.
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]