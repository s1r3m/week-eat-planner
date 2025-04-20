FROM python:3.11-slim

# Update and install packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Install requiremnents
COPY pyproject.toml uv.lock /
RUN pip install uv==0.6.13

RUN uv sync

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/app

# Add wait-for-it
RUN curl -o /usr/local/bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

COPY start.sh /usr/local/bin/

# CMD [ "uvicorn", "week_eat_planner.main:app", "--host", "0.0.0.0", "--port", "8000" ]
ENTRYPOINT [ "start.sh" ]
