FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1     MCP_HOST=0.0.0.0     MCP_PORT=8002

WORKDIR /usr/src/app

RUN pip install --no-cache-dir uv
COPY pyproject.toml README.md ./
COPY src ./src
RUN uv pip install --system .

CMD ["python", "-m", "cv_document_mcp.server"]
